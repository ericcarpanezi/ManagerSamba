import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from '../realtime/realtime.gateway';

type AuditEvent = {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
};

@Injectable()
export class AuditService {
  private readonly events: AuditEvent[] = [];

  constructor(private readonly realtimeGateway: RealtimeGateway) {}

  list() {
    return this.events;
  }

  record(action: string, actor: string, target: string): AuditEvent {
    const event = {
      id: `evt-${Date.now()}`,
      action,
      actor,
      target,
      timestamp: new Date().toISOString(),
    };

    this.events.unshift(event);
    this.realtimeGateway.emitAuditEvent(event);
    return event;
  }
}
