import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user';

@Controller('audit')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Permissions('audit:read')
  @Get('events')
  list() {
    return this.auditService.list();
  }

  @Permissions('audit:write')
  @Post('events')
  async create(
    @Body()
    body: {
      action: string;
      actor: string;
      target: string;
      metadata?: string;
    },
    @CurrentUser() user: AuthUser,
    @Req() request: Request,
  ) {
    return this.auditService.record(
      body.action,
      body.actor || user.username,
      body.target,
      body.metadata,
      request.ip,
    );
  }
}
