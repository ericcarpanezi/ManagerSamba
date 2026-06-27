import { Injectable } from '@nestjs/common';
import { DirectoryService } from '../directory/directory.service';
import { AuditService } from '../audit/audit.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly directoryService: DirectoryService,
    private readonly auditService: AuditService,
  ) {}

  async list() {
    return this.directoryService.listUsers();
  }

  async resetPassword(
    id: string,
    body: ResetPasswordDto,
    actor: string,
    ipAddress?: string,
  ) {
    const result = await this.directoryService.resetUserPassword(
      id,
      body.newPassword,
    );

    await this.auditService.record(
      'users.reset_password',
      actor,
      id,
      JSON.stringify({
        forceChangeAtNextLogon: body.forceChangeAtNextLogon ?? true,
        usedGeneratedPassword: !body.newPassword,
        status: result.status,
      }),
      ipAddress,
    );

    return {
      id,
      forceChangeAtNextLogon: body.forceChangeAtNextLogon ?? true,
      ...result,
    };
  }
}
