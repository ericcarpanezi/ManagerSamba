import { Injectable } from '@nestjs/common';

type OuNode = {
  id: string;
  dn: string;
  name: string;
  children: OuNode[];
};

@Injectable()
export class OusService {
  tree(): OuNode[] {
    return [
      {
        id: 'ou-root-users',
        dn: 'OU=Users,DC=empresa,DC=local',
        name: 'Users',
        children: [
          {
            id: 'ou-admins',
            dn: 'OU=Admins,OU=Users,DC=empresa,DC=local',
            name: 'Admins',
            children: [],
          },
        ],
      },
      {
        id: 'ou-root-computers',
        dn: 'OU=Computers,DC=empresa,DC=local',
        name: 'Computers',
        children: [],
      },
    ];
  }
}
