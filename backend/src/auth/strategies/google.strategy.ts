import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';

import { AuthService } from '../auth.service';

interface GoogleProfile {
  id: string;
  displayName: string;
  name?: { givenName?: string; familyName?: string };
  emails?: Array<{ value: string; verified?: boolean }>;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GoogleProfile,
  ) {
    const email =
      profile.emails?.[0]?.value ?? `google${profile.id}@noemail.invalid`;
    const displayName =
      profile.displayName ?? profile.name?.givenName ?? `google${profile.id}`;

    return this.authService.findOrCreateFromOAuth({
      username: `google_${profile.id}`,
      name: displayName,
      email,
      provider: 'google',
    });
  }
}
