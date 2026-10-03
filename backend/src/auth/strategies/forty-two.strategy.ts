import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';

import { AuthService } from '../auth.service';

interface FortyTwoProfile {
  id: string;
  login: string;
  displayname: string;
  email: string;
}

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly authService: AuthService) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.FORTY_TWO_CLIENT_ID!,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET!,
      callbackURL: process.env.FORTY_TWO_CALLBACK_URL!,
      scope: ['public'],
    });
  }

  userProfile(
    accessToken: string,
    done: (err: Error | null, profile?: FortyTwoProfile) => void,
  ): void {
    fetch('https://api.intra.42.fr/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`42 API returned ${res.status}`);
        return res.json();
      })
      .then((data: FortyTwoProfile) => {
        done(null, {
          id: String(data.id),
          login: data.login,
          displayname: data.displayname,
          email: data.email,
        });
      })
      .catch((err: Error) => done(err));
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: FortyTwoProfile,
  ) {
    return this.authService.findOrCreateFromOAuth({
      username: `42_${profile.login}`,
      name: profile.displayname,
      email: profile.email,
    });
  }
}
