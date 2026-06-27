import { Injectable } from '@nestjs/common';

type DirectoryGroup = {
  id: string;
  name: string;
  description: string;
  members: string[];
};

@Injectable()
export class GroupsService {
  private readonly groups: DirectoryGroup[] = [
    {
      id: 'g-domain-admins',
      name: 'Domain Admins',
      description: 'Administradores do domínio',
      members: ['administrator'],
    },
  ];

  list() {
    return this.groups;
  }
}
