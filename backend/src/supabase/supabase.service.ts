import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import 'multer';

import { createClient } from '@supabase/supabase-js';

const BUCKET = 'Avatars';

@Injectable()
export class SupabaseService {
  private client: ReturnType<typeof createClient>;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      throw new Error(
        'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined',
      );
    }

    this.client = createClient(url, key);
  }

  async deleteAvatar(userId: number): Promise<void> {
    const { data: files } = await this.client.storage
      .from(BUCKET)
      .list(`${userId}`);

    if (!files?.length) return;

    const paths = files.map((f) => `${userId}/${f.name}`);
    const { error } = await this.client.storage.from(BUCKET).remove(paths);

    if (error) {
      throw new InternalServerErrorException(
        `Storage delete failed: ${error.message}`,
      );
    }
  }

  async uploadAvatar(
    userId: number,
    file: Express.Multer.File,
  ): Promise<string> {
    const ext =
      file.originalname.split('.').pop() ?? file.mimetype.split('/').pop();
    if (!ext) {
      throw new BadRequestException('Could not determine file extension');
    }

    const path = `${userId}/avatar.${ext}`;

    const { error } = await this.client.storage
      .from(BUCKET)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new InternalServerErrorException(
        `Storage upload failed: ${error.message}`,
      );
    }

    const { data } = this.client.storage.from(BUCKET).getPublicUrl(path);
    return `${data.publicUrl}?t=${Date.now()}`;
  }
}
