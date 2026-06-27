import { Injectable } from '@nestjs/common';
import { DirectoryService } from '../directory/directory.service';

@Injectable()
export class GroupsService {
  constructor(private readonly directoryService: DirectoryService) {}

  async list() {
    return this.directoryService.listGroups();
  }
}
