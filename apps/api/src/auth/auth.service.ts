import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DirectoryService } from '../directory/directory.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly directoryService: DirectoryService,
  ) {}

  async login(username: string, password: string) {
    await this.directoryService.validateCredentials(username, password);

    const payload = {
      sub: username,
      roles: ['admin'],
      permissions: ['users:read', 'users:write', 'groups:write', 'ous:write'],
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        username,
      },
    };
  }

  me(username: string) {
    return {
      username,
    };
  }
}
