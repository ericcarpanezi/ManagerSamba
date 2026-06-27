import { Module } from '@nestjs/common';
import { ComputersController } from './computers.controller';
import { ComputersService } from './computers.service';
import { DirectoryModule } from '../directory/directory.module';

@Module({
  imports: [DirectoryModule],
  controllers: [ComputersController],
  providers: [ComputersService],
})
export class ComputersModule {}
