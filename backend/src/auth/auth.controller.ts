import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  // Step 1: redirect user to 42 login page
  @Get('42')
  @UseGuards(AuthGuard('42'))
  redirectToFortyTwo() {
    // Passport handles the redirect automatically
  }

  // Step 2: 42 redirects back here after user grants permission
  @Get('42/callback')
  @UseGuards(AuthGuard('42'))
  fortyTwoCallback(@Req() req: { user: unknown }) {
    // The validated user from FortyTwoStrategy.validate() is attached to req.user
    return {
      message: 'Authentication successful',
      user: req.user,
    };
  }
}
