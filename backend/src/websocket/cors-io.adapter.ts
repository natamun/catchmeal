import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server, ServerOptions } from 'socket.io';

export class CorsIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: unknown): Server {
    const opts = (options ?? {}) as ServerOptions;
    return super.createIOServer(port, {
      ...opts,
      cors: { origin: process.env.FRONTEND_URL, credentials: true },
    }) as Server;
  }
}
