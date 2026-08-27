import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendDataExportConfirmation(userEmail: string): Promise<void> {
    await this.resend.emails.send({
      from: 'KcalApp <onboarding@resend.dev>',
      to: userEmail,
      subject: 'Your data export is ready',
      html: `
        <h2>Your personal data export</h2>
        <p>As requested, your personal data has been successfully exported.</p>
        <p>If you did not request this export, please contact us immediately.</p>
        <br />
        <p>The KcalApp team</p>
      `,
    });
  }

  async sendAccountDeletionConfirmation(userEmail: string): Promise<void> {
    await this.resend.emails.send({
      from: 'KcalApp <onboarding@resend.dev>',
      to: userEmail,
      subject: 'Your account has been deleted',
      html: `
        <h2>Account deletion confirmed</h2>
        <p>Your account and personal data have been permanently removed from KcalApp.</p>
        <p>If you did not request this, please contact us immediately.</p>
        <br />
        <p>The KcalApp team</p>
      `,
    });
  }
}
