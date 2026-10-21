import { Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

import { EmailService } from './email.service';

jest.mock('nodemailer');

describe('EmailService', () => {
  const sendMail = jest.fn();
  let service: EmailService;
  let logError: jest.SpyInstance;

  beforeEach(() => {
    sendMail.mockReset();
    jest
      .mocked(nodemailer.createTransport)
      .mockReturnValue({ sendMail } as never);
    logError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    service = new EmailService();
  });

  afterEach(() => {
    logError.mockRestore();
  });

  describe('transport', () => {
    const initialEnv = {
      NODE_ENV: process.env.NODE_ENV,
      MAILTRAP_PORT: process.env.MAILTRAP_PORT,
    };

    afterEach(() => {
      for (const [key, value] of Object.entries(initialEnv)) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    });

    it('upgrades with STARTTLS and requires it in production on port 2525', () => {
      process.env.NODE_ENV = 'production';
      process.env.MAILTRAP_PORT = '2525';

      service = new EmailService();

      expect(nodemailer.createTransport).toHaveBeenLastCalledWith(
        expect.objectContaining({
          port: 2525,
          secure: false,
          requireTLS: true,
        }),
      );
    });

    it('uses TLS from the start on port 465', () => {
      process.env.MAILTRAP_PORT = '465';

      service = new EmailService();

      expect(nodemailer.createTransport).toHaveBeenLastCalledWith(
        expect.objectContaining({ port: 465, secure: true }),
      );
    });
  });

  it('sends the export confirmation to the user', async () => {
    sendMail.mockResolvedValue({});

    await service.sendDataExportConfirmation('user@example.com');

    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.com' }),
    );
    expect(logError).not.toHaveBeenCalled();
  });

  it('logs instead of throwing when the export email fails', async () => {
    sendMail.mockRejectedValue(new Error('535 The email limit is reached'));

    await expect(
      service.sendDataExportConfirmation('user@example.com'),
    ).resolves.toBeUndefined();
    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining('535 The email limit is reached'),
    );
  });

  it('logs instead of throwing when the deletion email fails', async () => {
    sendMail.mockRejectedValue(new Error('535 The email limit is reached'));

    await expect(
      service.sendAccountDeletionConfirmation('user@example.com'),
    ).resolves.toBeUndefined();
    expect(logError).toHaveBeenCalledWith(
      expect.stringContaining('535 The email limit is reached'),
    );
  });
});
