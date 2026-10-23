import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';

import { safeRedirectUrl } from './frontend-redirect';

/**
 * Thrown when an OAuth sign-in would reach an existing account through an
 * email address the provider does not confirm.
 */
export class OAuthEmailNotVerifiedException extends UnauthorizedException {
  constructor() {
    super('The email address is not verified by the OAuth provider');
  }
}

/** Sends the browser back to the frontend with an error it can explain. */
@Catch(OAuthEmailNotVerifiedException)
export class OAuthEmailNotVerifiedFilter implements ExceptionFilter {
  catch(_exception: OAuthEmailNotVerifiedException, host: ArgumentsHost) {
    host
      .switchToHttp()
      .getResponse<Response>()
      .redirect(safeRedirectUrl('?error=oauth_unverified_email'));
  }
}
