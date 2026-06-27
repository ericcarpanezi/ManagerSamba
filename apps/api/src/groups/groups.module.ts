import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { DirectoryModule } from '../directory/directory.module';

@Module({
  imports: [DirectoryModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
