import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DirectoryModule } from '../directory/directory.module';

@Module({
  imports: [DirectoryModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
