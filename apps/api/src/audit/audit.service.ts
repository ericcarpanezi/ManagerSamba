import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { PrismaService } from '../prisma/prisma.service';

type AuditEvent = {
  id: string;
  action: string;
  actor: string;
  target: string;
  metadata?: string | null;
  ipAddress?: string | null;
  timestamp: string;
};

@Injectable()
export class AuditService {
  constructor(
    private readonly realtimeGateway: RealtimeGateway,
    private readonly prismaService: PrismaService,
  ) {}

  async list() {
    const events = await this.prismaService.auditEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return events.map((event) => ({
      id: event.id,
      action: event.action,
      actor: event.actor,
      target: event.target,
      metadata: event.metadata,
      ipAddress: event.ipAddress,
      timestamp: event.createdAt.toISOString(),
    }));
  }

  async record(
    action: string,
    actor: string,
    target: string,
    metadata?: string,
    ipAddress?: string,
  ): Promise<AuditEvent> {
    const event = await this.prismaService.auditEvent.create({
      data: {
        action,
        actor,
        target,
        metadata,
        ipAddress,
      },
    });

    const normalizedEvent: AuditEvent = {
      id: event.id,
      action,
      actor,
      target,
      metadata: event.metadata,
      ipAddress: event.ipAddress,
      timestamp: event.createdAt.toISOString(),
    };

    this.realtimeGateway.emitAuditEvent(normalizedEvent);
    return normalizedEvent;
  }
}
