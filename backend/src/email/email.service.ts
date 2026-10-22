import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

const APP_NAME = 'CatCHMeal';

const BASE_STYLE = `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #d8f3dc;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: #081c15;
      padding: 40px 16px;
    }
    .card {
      background: #ffffff;
      border-radius: 16px;
      border: 1px solid #95d5b2;
      max-width: 520px;
      margin: 0 auto;
      overflow: hidden;
    }
    .header {
      background-color: #40916c;
      padding: 28px 32px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .header p {
      color: #b7e4c7;
      font-size: 13px;
      margin-top: 4px;
    }
    .body {
      padding: 32px;
    }
    .body p {
      font-size: 14px;
      line-height: 1.6;
      color: #2d6a4f;
      margin-bottom: 12px;
    }
    .body p:last-child {
      margin-bottom: 0;
    }
    .notice {
      background-color: #d8f3dc;
      border-left: 3px solid #40916c;
      border-radius: 8px;
      padding: 12px 16px;
      margin: 20px 0;
      font-size: 13px;
      color: #1b4332;
    }
    .actions {
      text-align: center;
      margin: 24px 0;
    }
    .button {
      display: inline-block;
      background-color: #40916c;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
    }
    .link {
      word-break: break-all;
    }
    .footer {
      border-top: 1px solid #95d5b2;
      padding: 16px 32px;
      text-align: center;
      font-size: 12px;
      color: #52b788;
    }
  </style>
`;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    const port = Number(process.env.MAILTRAP_PORT);
    this.transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port,
      secure: port === 465,
      requireTLS: process.env.NODE_ENV === 'production',
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }

  private get fromAddress(): string {
    return process.env.EMAIL_FROM ?? `"${APP_NAME}" <noreply@catchmeal.dev>`;
  }

  private async send(mail: nodemailer.SendMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail(mail);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      this.logger.error(`Email "${String(mail.subject)}" not sent: ${reason}`);
    }
  }

  async sendDataExportConfirmation(userEmail: string): Promise<void> {
    await this.send({
      from: this.fromAddress,
      to: userEmail,
      subject: 'Vos données ont été exportées',
      html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${BASE_STYLE}
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Export de données</h1>
      <p>${APP_NAME} — Confidentialité</p>
    </div>
    <div class="body">
      <p>Votre demande d'export de données personnelles a bien été traitée.</p>
      <p>Le fichier téléchargé contient l'ensemble des informations associées à votre compte : profil, données de santé, repas, historique de poids, objectifs, amis, messages et activités.</p>
      <div class="notice">
        Si vous n'êtes pas à l'origine de cette demande, contactez-nous immédiatement.
      </div>
      <p>— L'équipe ${APP_NAME}</p>
    </div>
    <div class="footer">
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </div>
  </div>
</body>
</html>`,
      text: `Export de données

Votre demande d'export de données personnelles a bien été traitée.

Le fichier téléchargé contient l'ensemble des informations associées à votre compte : profil, données de santé, repas, historique de poids, objectifs, amis, messages et activités.

Si vous n'êtes pas à l'origine de cette demande, contactez-nous immédiatement.

— L'équipe ${APP_NAME}`,
    });
  }

  async sendAccountDeletionConfirmation(userEmail: string): Promise<void> {
    await this.send({
      from: this.fromAddress,
      to: userEmail,
      subject: 'Votre compte a été supprimé',
      html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${BASE_STYLE}
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Compte supprimé</h1>
      <p>${APP_NAME} — Confidentialité</p>
    </div>
    <div class="body">
      <p>La suppression de votre compte a bien été effectuée.</p>
      <p>Toutes vos données personnelles ont été anonymisées et ne sont plus accessibles sur ${APP_NAME}.</p>
      <div class="notice">
        Si vous n'êtes pas à l'origine de cette demande, contactez-nous immédiatement.
      </div>
      <p>— L'équipe ${APP_NAME}</p>
    </div>
    <div class="footer">
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </div>
  </div>
</body>
</html>`,
      text: `Compte supprimé

La suppression de votre compte a bien été effectuée.

Toutes vos données personnelles ont été anonymisées et ne sont plus accessibles sur ${APP_NAME}.

Si vous n'êtes pas à l'origine de cette demande, contactez-nous immédiatement.

— L'équipe ${APP_NAME}`,
    });
  }

  async sendVerificationEmail(
    userEmail: string,
    verificationUrl: string,
  ): Promise<void> {
    return this.send({
      from: this.fromAddress,
      to: userEmail,
      subject: 'Confirmez votre adresse e-mail',
      html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${BASE_STYLE}
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Confirmez votre adresse</h1>
      <p>${APP_NAME} — Inscription</p>
    </div>
    <div class="body">
      <p>Bienvenue sur ${APP_NAME} ! Pour finaliser la création de votre compte, confirmez votre adresse e-mail.</p>
      <div class="actions">
        <a class="button" href="${verificationUrl}">Confirmer mon adresse</a>
      </div>
      <p class="link">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br />${verificationUrl}</p>
      <div class="notice">
        Ce lien est valable 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement ce message.
      </div>
      <p>— L'équipe ${APP_NAME}</p>
    </div>
    <div class="footer">
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </div>
  </div>
</body>
</html>`,
      text: `Confirmez votre adresse

Bienvenue sur ${APP_NAME} ! Pour finaliser la création de votre compte, confirmez votre adresse e-mail en ouvrant ce lien :

${verificationUrl}

Ce lien est valable 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement ce message.

— L'équipe ${APP_NAME}`,
    });
  }

  async sendPasswordResetEmail(
    userEmail: string,
    resetUrl: string,
  ): Promise<void> {
    await this.send({
      from: this.fromAddress,
      to: userEmail,
      subject: 'Réinitialisation de votre mot de passe',
      html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${BASE_STYLE}
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Mot de passe oublié</h1>
      <p>${APP_NAME} — Sécurité</p>
    </div>
    <div class="body">
      <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.</p>
      <div class="actions">
        <a class="button" href="${resetUrl}">Choisir un nouveau mot de passe</a>
      </div>
      <p class="link">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br />${resetUrl}</p>
      <div class="notice">
        Ce lien est valable 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message : votre mot de passe ne sera pas modifié.
      </div>
      <p>— L'équipe ${APP_NAME}</p>
    </div>
    <div class="footer">
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </div>
  </div>
</body>
</html>`,
      text: `Mot de passe oublié

Vous avez demandé à réinitialiser votre mot de passe. Ouvrez ce lien pour en choisir un nouveau :

${resetUrl}

Ce lien est valable 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message : votre mot de passe ne sera pas modifié.

— L'équipe ${APP_NAME}`,
    });
  }

  async sendPasswordChangedEmail(userEmail: string): Promise<void> {
    await this.send({
      from: this.fromAddress,
      to: userEmail,
      subject: 'Votre mot de passe a été modifié',
      html: `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${BASE_STYLE}
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Mot de passe modifié</h1>
      <p>${APP_NAME} — Sécurité</p>
    </div>
    <div class="body">
      <p>Le mot de passe de votre compte vient d'être modifié.</p>
      <div class="notice">
        Si vous n'êtes pas à l'origine de cette modification, contactez-nous immédiatement.
      </div>
      <p>— L'équipe ${APP_NAME}</p>
    </div>
    <div class="footer">
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </div>
  </div>
</body>
</html>`,
      text: `Mot de passe modifié

Le mot de passe de votre compte vient d'être modifié.

Si vous n'êtes pas à l'origine de cette modification, contactez-nous immédiatement.

— L'équipe ${APP_NAME}`,
    });
  }
}
