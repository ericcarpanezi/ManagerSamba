import { Controller, Get, UseGuards } from '@nestjs/common';
import { OusService } from './ous.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('ous')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class OusController {
  constructor(private readonly ousService: OusService) {}

  @Permissions('ous:read')
  @Get('tree')
  tree() {
    return this.ousService.tree();
  }
}
