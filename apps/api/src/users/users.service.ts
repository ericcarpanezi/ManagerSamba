import { Injectable } from '@nestjs/common';

type DirectoryUser = {
  id: string;
  displayName: string;
  samAccountName: string;
  email: string;
  enabled: boolean;
  ouDn: string;
};

@Injectable()
export class UsersService {
  private readonly users: DirectoryUser[] = [
    {
      id: 'u-admin',
      displayName: 'Administrador Samba',
      samAccountName: 'administrator',
      email: 'administrator@empresa.local',
      enabled: true,
      ouDn: 'OU=Admins,DC=empresa,DC=local',
    },
  ];

  list() {
    return this.users;
  }

  resetPassword(id: string) {
    return {
      id,
      status: 'password_reset_requested',
      forceChangeAtNextLogon: true,
    };
  }
}
