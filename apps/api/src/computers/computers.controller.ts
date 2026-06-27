import { Controller, Get, UseGuards } from '@nestjs/common';
import { ComputersService } from './computers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('computers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ComputersController {
  constructor(private readonly computersService: ComputersService) {}

  @Permissions('computers:read')
  @Get()
  list() {
    return this.computersService.list();
  }
}
