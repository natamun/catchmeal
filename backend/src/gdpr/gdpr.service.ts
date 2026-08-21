import { Injectable } from '@nestjs/common';

@Injectable()
export class GdprService {
  exportUserData() {
    // TODO: implement user data aggregation and export
    return { message: 'GDPR export endpoint ready' };
  }
}
