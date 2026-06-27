import { Module } from '@nestjs/common';
import { OusController } from './ous.controller';
import { OusService } from './ous.service';

@Module({
  controllers: [OusController],
  providers: [OusService]
})
export class OusModule {}
