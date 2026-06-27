import { Injectable } from '@nestjs/common';
import { DirectoryService } from '../directory/directory.service';
import { AuditService } from '../audit/audit.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly directoryService: DirectoryService,
    private readonly auditService: AuditService,
  ) {}

  async list() {
    return this.directoryService.listUsers();
  }

  async create(body: CreateUserDto, actor: string, ipAddress?: string) {
    const result = await this.directoryService.createUser(body);

    await this.auditService.record(
      'users.create',
      actor,
      body.username,
      JSON.stringify({
        displayName: body.displayName ?? null,
        email: body.email ?? null,
        ouDn: body.ouDn ?? null,
        status: result.status,
      }),
      ipAddress,
    );

    return {
      username: body.username,
      ...result,
    };
  }

  async update(
    id: string,
    body: UpdateUserDto,
    actor: string,
    ipAddress?: string,
  ) {
    const result = await this.directoryService.updateUser(id, body);

    await this.auditService.record(
      'users.update',
      actor,
      id,
      JSON.stringify({
        displayName: body.displayName ?? null,
        email: body.email ?? null,
        status: result.status,
      }),
      ipAddress,
    );

    return {
      id,
      ...result,
    };
  }

  async setEnabled(
    id: string,
    enabled: boolean,
    actor: string,
    ipAddress?: string,
  ) {
    const result = await this.directoryService.setUserEnabled(id, enabled);
    await this.auditService.record(
      enabled ? 'users.enable' : 'users.disable',
      actor,
      id,
      JSON.stringify({ status: result.status }),
      ipAddress,
    );

    return {
      id,
      enabled,
      ...result,
    };
  }

  async moveUser(
    id: string,
    targetOuDn: string,
    actor: string,
    ipAddress?: string,
  ) {
    const result = await this.directoryService.moveUser(id, targetOuDn);
    await this.auditService.record(
      'users.move',
      actor,
      id,
      JSON.stringify({ targetOuDn, status: result.status }),
      ipAddress,
    );

    return {
      id,
      targetOuDn,
      ...result,
    };
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
