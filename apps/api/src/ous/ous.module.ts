import { Module } from '@nestjs/common';
import { OusController } from './ous.controller';
import { OusService } from './ous.service';
import { DirectoryModule } from '../directory/directory.module';

@Module({
  imports: [DirectoryModule],
  controllers: [OusController],
  providers: [OusService],
})
export class OusModule {}
