import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DirectoryModule } from '../directory/directory.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [DirectoryModule, AuditModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
