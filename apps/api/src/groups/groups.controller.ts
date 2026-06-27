import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupMemberDto } from './dto/group-member.dto';

@Controller('groups')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Permissions('groups:read')
  @Get()
  list() {
    return this.groupsService.list();
  }

  @Permissions('groups:write')
  @Post()
  create(
    @Body() body: CreateGroupDto,
    @CurrentUser() user: AuthUser,
    @Req() request: Request,
  ) {
    return this.groupsService.create(body, user.username, request.ip);
  }

  @Permissions('groups:write')
  @Post(':id/members')
  addMember(
    @Param('id') id: string,
    @Body() body: GroupMemberDto,
    @CurrentUser() user: AuthUser,
    @Req() request: Request,
  ) {
    return this.groupsService.addMember(
      id,
      body.memberName,
      user.username,
      request.ip,
    );
  }

  @Permissions('groups:write')
  @Delete(':id/members/:memberName')
  removeMember(
    @Param('id') id: string,
    @Param('memberName') memberName: string,
    @CurrentUser() user: AuthUser,
    @Req() request: Request,
  ) {
    return this.groupsService.removeMember(
      id,
      memberName,
      user.username,
      request.ip,
    );
  }
}
