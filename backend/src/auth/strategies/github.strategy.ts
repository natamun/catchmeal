import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';

import { AuthService } from '../auth.service';

interface GitHubEmail {
  value: string;
  primary?: boolean;
  verified?: boolean;
}

interface GitHubProfile {
  id: string;
  username?: string;
  displayName?: string;
  emails?: GitHubEmail[];
}

/**
 * The address GitHub vouches for: the primary verified one, else any verified
 * one, else the primary (unverified) one.
 */
function pickEmail(emails: GitHubEmail[] = []): GitHubEmail | undefined {
  return (
    emails.find((e) => e.primary && e.verified) ??
    emails.find((e) => e.verified) ??
    emails.find((e) => e.primary) ??
    emails[0]
  );
}

@Injectable()
export class GitHubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email'],
      allRawEmails: true,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: GitHubProfile,
  ) {
    const emailEntry = pickEmail(profile.emails);
    const email = emailEntry?.value ?? `github_${profile.id}@noemail.invalid`;
    const name =
      profile.displayName ?? profile.username ?? `github_${profile.id}`;

    return this.authService.findOrCreateFromOAuth({
      username: `github_${profile.id}`,
      name,
      email,
      emailVerified: emailEntry?.verified === true,
      provider: 'github',
    });
  }
}
