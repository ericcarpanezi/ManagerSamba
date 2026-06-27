import {
  Body,
  Controller,
  Get,
  Patch,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/types/auth-user';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MoveUserDto } from './dto/move-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Permissions('users:read')
  @Get()
  list() {
    return this.usersService.list();
  }

  @Permissions('users:write')
  @Post()
  create(
    @Body() body: CreateUserDto,
    @CurrentUser() user: AuthUser,
    @Req() request: Request,
  ) {
    return this.usersService.create(body, user.username, request.ip);
  }

  @Permissions('users:write')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @CurrentUser() user: AuthUser,
    @Req() request: Request,
  ) {
    return this.usersService.update(id, body, user.username, request.ip);
  }

  @Permissions('users:write')
  @Post(':id/enable')
  enable(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Req() request: Request,
  ) {
    return this.usersService.setEnabled(id, true, user.username, request.ip);
  }

  @Permissions('users:write')
  @Post(':id/disable')
  disable(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Req() request: Request,
  ) {
    return this.usersService.setEnabled(id, false, user.username, request.ip);
  }

  @Permissions('users:write')
  @Post(':id/move')
  move(
    @Param('id') id: string,
    @Body() body: MoveUserDto,
    @CurrentUser() user: AuthUser,
    @Req() request: Request,
  ) {
    return this.usersService.moveUser(
      id,
      body.targetOuDn,
      user.username,
      request.ip,
    );
  }

  @Permissions('users:write')
  @Post(':id/reset-password')
  resetPassword(
    @Param('id') id: string,
    @Body() body: ResetPasswordDto,
    @CurrentUser() user: AuthUser,
    @Req() request: Request,
  ) {
    return this.usersService.resetPassword(id, body, user.username, request.ip);
  }
}
