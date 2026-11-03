import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller('avatar-proxy')
export class AvatarProxyController {
  @Get(':encodedUrl')
  async proxyAvatar(
    @Param('encodedUrl') encodedUrl: string,
    @Res() res: Response,
  ) {
    try {
      const url = decodeURIComponent(encodedUrl);

      if (!url.includes('supabase.co')) {
        res.status(400).send('Invalid URL');
        return;
      }

      const response = await fetch(url);

      if (!response.ok) {
        res.status(response.status).send('Failed to fetch avatar');
        return;
      }

      const contentType = response.headers.get('content-type') || 'image/png';
      const buffer = await response.arrayBuffer();

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.send(Buffer.from(buffer));
    } catch {
      res.status(500).send('Proxy error');
    }
  }
}
