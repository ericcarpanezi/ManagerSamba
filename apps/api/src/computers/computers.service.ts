import { Injectable } from '@nestjs/common';

type DirectoryComputer = {
  id: string;
  name: string;
  operatingSystem: string;
  ouDn: string;
};

@Injectable()
export class ComputersService {
  private readonly computers: DirectoryComputer[] = [
    {
      id: 'c-ws01',
      name: 'WS-01',
      operatingSystem: 'Windows 11',
      ouDn: 'OU=Workstations,DC=empresa,DC=local',
    },
  ];

  list() {
    return this.computers;
  }
}
