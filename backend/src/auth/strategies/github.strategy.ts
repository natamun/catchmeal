import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

import { AuthService } from '../auth.service';

interface GitHubProfile {
  id: string;
  username?: string;
  displayName?: string;
  emails?: Array<{ value: string }>;
}

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly authService: AuthService) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GitHubProfile,
  ) {
    const email =
      profile.emails?.[0]?.value ?? `github_${profile.id}@noemail.invalid`;
    const name =
      profile.displayName ?? profile.username ?? `github_${profile.id}`;

    return this.authService.findOrCreateFromOAuth({
      username: `github_${profile.id}`,
      name,
      email,
    });
  }
}
