import { Injectable } from '@nestjs/common';
import { DirectoryService } from '../directory/directory.service';
import { AuditService } from '../audit/audit.service';
import { CreateGroupDto } from './dto/create-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    private readonly directoryService: DirectoryService,
    private readonly auditService: AuditService,
  ) {}

  async list() {
    return this.directoryService.listGroups();
  }

  async create(body: CreateGroupDto, actor: string, ipAddress?: string) {
    const result = await this.directoryService.createGroup(body);
    await this.auditService.record(
      'groups.create',
      actor,
      body.name,
      JSON.stringify({
        description: body.description ?? null,
        status: result.status,
      }),
      ipAddress,
    );

    return {
      group: body.name,
      ...result,
    };
  }

  async addMember(
    groupId: string,
    memberName: string,
    actor: string,
    ipAddress?: string,
  ) {
    const result = await this.directoryService.addGroupMember(
      groupId,
      memberName,
    );
    await this.auditService.record(
      'groups.add_member',
      actor,
      groupId,
      JSON.stringify({ memberName, status: result.status }),
      ipAddress,
    );

    return {
      group: groupId,
      memberName,
      ...result,
    };
  }

  async removeMember(
    groupId: string,
    memberName: string,
    actor: string,
    ipAddress?: string,
  ) {
    const result = await this.directoryService.removeGroupMember(
      groupId,
      memberName,
    );
    await this.auditService.record(
      'groups.remove_member',
      actor,
      groupId,
      JSON.stringify({ memberName, status: result.status }),
      ipAddress,
    );

    return {
      group: groupId,
      memberName,
      ...result,
    };
  }
}
