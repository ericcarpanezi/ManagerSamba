import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user';
import { ResetPasswordDto } from './dto/reset-password.dto';

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
