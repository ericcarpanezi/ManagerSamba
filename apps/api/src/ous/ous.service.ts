import { Injectable } from '@nestjs/common';
import { DirectoryService } from '../directory/directory.service';

export type OuNode = {
  id: string;
  dn: string;
  name: string;
  children: OuNode[];
};

@Injectable()
export class OusService {
  constructor(private readonly directoryService: DirectoryService) {}

  async tree(): Promise<OuNode[]> {
    return this.directoryService.listOuTree();
  }
}
