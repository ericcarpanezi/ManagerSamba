import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('events')
  list() {
    return this.auditService.list();
  }

  @Post('events')
  create(
    @Body()
    body: {
      action: string;
      actor: string;
      target: string;
    },
  ) {
    return this.auditService.record(body.action, body.actor, body.target);
  }
}
