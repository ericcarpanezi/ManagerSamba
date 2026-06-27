import { Controller, Get, UseGuards } from '@nestjs/common';
import { DirectoryService } from './directory.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('directory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DirectoryController {
  constructor(private readonly directoryService: DirectoryService) {}

  @Permissions('directory:read')
  @Get('status')
  status() {
    return this.directoryService.getIntegrationStatus();
  }
}
