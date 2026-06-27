import { Module } from '@nestjs/common';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';
import { DirectoryModule } from '../directory/directory.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [DirectoryModule, AuditModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
