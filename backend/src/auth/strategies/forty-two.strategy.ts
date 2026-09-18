import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';

import { AuthService } from '../auth.service';

// Profile shape returned by the 42 API
interface FortyTwoProfile {
  id: string;
  login: string;
  email: string;
  displayname: string;
}

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly authService: AuthService) {
    super({
      authorizationURL: 'https://api.intra.42.fr/oauth/authorize',
      tokenURL: 'https://api.intra.42.fr/oauth/token',
      clientID: process.env.FORTY_TWO_CLIENT_ID,
      clientSecret: process.env.FORTY_TWO_CLIENT_SECRET,
      callbackURL: process.env.FORTY_TWO_CALLBACK_URL,
      scope: ['public'],
    });
  }

  // Called after 42 grants the token — fetches the user profile
  async userProfile(
    accessToken: string,
    done: (err: Error | null, profile?: FortyTwoProfile) => void,
  ): Promise<void> {
    try {
      const response = await fetch('https://api.intra.42.fr/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      done(null, {
        id: String(data.id),
        login: data.login,
        email: data.email,
        displayname: data.displayname,
      });
    } catch (err) {
      done(err as Error);
    }
  }

  // Called with the verified profile — finds or creates the user, then signs a JWT
  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: FortyTwoProfile,
  ) {
    const user = await this.authService.findOrCreateFromOAuth({
      username: profile.login,
      name: profile.displayname,
      email: profile.email,
    });

    // Return SignInData shape expected by authService.signIn()
    return { userId: user.id, username: user.username };
  }
}
