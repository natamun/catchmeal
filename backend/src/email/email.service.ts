import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

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
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    const isProduction = process.env.NODE_ENV === 'production';
    this.transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: Number(process.env.MAILTRAP_PORT),
      secure: isProduction,
      requireTLS: isProduction,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }

  private get fromAddress(): string {
    return process.env.EMAIL_FROM ?? '"KcalApp" <noreply@kcalapp.dev>';
  }

  async sendDataExportConfirmation(userEmail: string): Promise<void> {
    await this.transporter.sendMail({
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
      <p>KcalApp — Confidentialité</p>
    </div>
    <div class="body">
      <p>Votre demande d'export de données personnelles a bien été traitée.</p>
      <p>Le fichier téléchargé contient l'ensemble des informations associées à votre compte : profil, repas, historique de poids et objectifs.</p>
      <div class="notice">
        Si vous n'êtes pas à l'origine de cette demande, contactez-nous immédiatement.
      </div>
      <p>— L'équipe KcalApp</p>
    </div>
    <div class="footer">
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </div>
  </div>
</body>
</html>`,
    });
  }

  async sendAccountDeletionConfirmation(userEmail: string): Promise<void> {
    await this.transporter.sendMail({
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
      <p>KcalApp — Confidentialité</p>
    </div>
    <div class="body">
      <p>La suppression de votre compte a bien été effectuée.</p>
      <p>Toutes vos données personnelles ont été anonymisées et ne sont plus accessibles sur KcalApp.</p>
      <div class="notice">
        Si vous n'êtes pas à l'origine de cette demande, contactez-nous immédiatement.
      </div>
      <p>— L'équipe KcalApp</p>
    </div>
    <div class="footer">
      Cet email a été envoyé automatiquement, merci de ne pas y répondre.
    </div>
  </div>
</body>
</html>`,
    });
  }
}
