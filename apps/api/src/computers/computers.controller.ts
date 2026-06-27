import { Controller, Get } from '@nestjs/common';
import { ComputersService } from './computers.service';

@Controller('computers')
export class ComputersController {
  constructor(private readonly computersService: ComputersService) {}

  @Get()
  list() {
    return this.computersService.list();
  }
}
