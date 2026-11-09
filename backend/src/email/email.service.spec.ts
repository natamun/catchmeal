import { Logger } from '@nestjs/common';
import { Resend } from 'resend';

import { EmailService } from './email.service';

jest.mock('resend');

describe('EmailService', () => {
  const sendMock = jest.fn();
  let service: EmailService;
  let logError: jest.SpyInstance;

  beforeEach(() => {
    sendMock.mockReset();
    jest.mocked(Resend).mockImplementation(
      () =>
        ({
          emails: { send: sendMock },
        }) as unknown as Resend,
    );
    logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
    service = new EmailService();
  });

  afterEach(() => {
    logError.mockRestore();
  });

  it('sends the export confirmation to the user', async () => {
    sendMock.mockResolvedValue({ data: { id: 'msg_123' }, error: null });

    await service.sendDataExportConfirmation('user@example.com');

    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.com' }),
    );
  });

  it('logs instead of throwing when the export email fails', async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { message: 'API rate limit exceeded' },
    });

    await expect(
      service.sendDataExportConfirmation('user@example.com'),
    ).resolves.not.toThrow();

    expect(logError).toHaveBeenCalled();
  });

  it('logs instead of throwing when the deletion email fails', async () => {
    sendMock.mockResolvedValue({
      data: null,
      error: { message: 'API rate limit exceeded' },
    });

    await expect(
      service.sendAccountDeletionConfirmation('user@example.com'),
    ).resolves.not.toThrow();

    expect(logError).toHaveBeenCalled();
  });

  describe('sendVerificationEmail', () => {
    const url = 'https://catchmeal.ch/verify?token=abc123';

    it('sends the confirmation link in both the html and the text version', async () => {
      sendMock.mockResolvedValue({ data: { id: 'msg_123' }, error: null });

      await service.sendVerificationEmail('alice@example.com', url);

      const [mail] = sendMock.mock.calls[0] as [
        { to: string; subject: string; html: string; text: string },
      ];
      expect(mail.to).toBe('alice@example.com');
      expect(mail.subject).toBe('Confirmez votre adresse e-mail');
      expect(mail.html).toContain(url);
      expect(mail.text).toContain(url);
    });

    it('logs instead of throwing when the verification email fails', async () => {
      sendMock.mockResolvedValue({
        data: null,
        error: { message: 'API rate limit exceeded' },
      });

      await expect(
        service.sendVerificationEmail('alice@example.com', url),
      ).resolves.not.toThrow();

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('sendPasswordResetEmail', () => {
    const url = 'https://catchmeal.ch/reset?token=xyz789';

    it('sends the reset link in both the html and the text version', async () => {
      sendMock.mockResolvedValue({ data: { id: 'msg_123' }, error: null });

      await service.sendPasswordResetEmail('alice@example.com', url);

      const [mail] = sendMock.mock.calls[0] as [
        { to: string; subject: string; html: string; text: string },
      ];
      expect(mail.to).toBe('alice@example.com');
      expect(mail.subject).toBe('Réinitialisation de votre mot de passe');
      expect(mail.html).toContain(url);
      expect(mail.text).toContain(url);
    });

    it('logs instead of throwing when the reset email fails', async () => {
      sendMock.mockResolvedValue({
        data: null,
        error: { message: 'API rate limit exceeded' },
      });

      await expect(
        service.sendPasswordResetEmail('alice@example.com', url),
      ).resolves.not.toThrow();

      expect(logError).toHaveBeenCalled();
    });
  });

  describe('sendPasswordChangedEmail', () => {
    it('sends the notification to the user', async () => {
      sendMock.mockResolvedValue({ data: { id: 'msg_123' }, error: null });

      await service.sendPasswordChangedEmail('alice@example.com');

      const [mail] = sendMock.mock.calls[0] as [
        { to: string; subject: string; html: string; text: string },
      ];
      expect(mail.to).toBe('alice@example.com');
      expect(mail.subject).toBe('Votre mot de passe a été modifié');
    });

    it('logs instead of throwing when the notification fails', async () => {
      sendMock.mockResolvedValue({
        data: null,
        error: { message: 'API rate limit exceeded' },
      });

      await expect(
        service.sendPasswordChangedEmail('alice@example.com'),
      ).resolves.not.toThrow();

      expect(logError).toHaveBeenCalled();
    });
  });
});
