import { Injectable } from '@nestjs/common';
import { DirectoryService } from '../directory/directory.service';

@Injectable()
export class UsersService {
  constructor(private readonly directoryService: DirectoryService) {}

  async list() {
    return this.directoryService.listUsers();
  }

  resetPassword(id: string) {
    return {
      id,
      status: 'password_reset_requested',
      forceChangeAtNextLogon: true,
    };
  }
}
