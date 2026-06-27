import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'AG Directory Manager API',
      version: '0.1.0',
      docs: '/api/docs',
      health: '/api/health',
    };
  }
}
