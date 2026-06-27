import { Controller, Get } from '@nestjs/common';
import { OusService } from './ous.service';

@Controller('ous')
export class OusController {
  constructor(private readonly ousService: OusService) {}

  @Get('tree')
  tree() {
    return this.ousService.tree();
  }
}
