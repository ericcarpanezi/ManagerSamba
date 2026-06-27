import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

type SambaDirectoryUser = {
  id: string;
  displayName: string;
  samAccountName: string;
  email: string;
  enabled: boolean;
  ouDn: string;
};

type SambaDirectoryGroup = {
  id: string;
  name: string;
  description: string;
  members: string[];
};

type SambaDirectoryComputer = {
  id: string;
  name: string;
  operatingSystem: string;
  ouDn: string;
};

type OuNode = {
  id: string;
  dn: string;
  name: string;
  children: OuNode[];
};

@Injectable()
export class DirectoryService {
  private readonly defaultUsers: SambaDirectoryUser[] = [
    {
      id: 'u-admin',
      displayName: 'Administrador Samba',
      samAccountName: 'administrator',
      email: 'administrator@empresa.local',
      enabled: true,
      ouDn: 'OU=Admins,DC=empresa,DC=local',
    },
  ];

  private readonly defaultGroups: SambaDirectoryGroup[] = [
    {
      id: 'g-domain-admins',
      name: 'Domain Admins',
      description: 'Administradores do dominio',
      members: ['administrator'],
    },
  ];

  private readonly defaultComputers: SambaDirectoryComputer[] = [
    {
      id: 'c-ws01',
      name: 'WS-01',
      operatingSystem: 'Windows',
      ouDn: 'OU=Computers,DC=empresa,DC=local',
    },
  ];

  private readonly defaultOuTree: OuNode[] = [
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

  validateCredentials(username: string, password: string): void {
    if (!username || !password) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }

  private get sambaToolPath(): string {
    return process.env.SAMBA_TOOL_PATH || 'samba-tool';
  }

  async runSambaTool(args: string[]) {
    if (args.length === 0) {
      throw new BadRequestException(
        'Argumentos do samba-tool são obrigatórios',
      );
    }

    const { stdout, stderr } = await execFileAsync(this.sambaToolPath, args, {
      timeout: 10_000,
    });
    return {
      stdout,
      stderr,
    };
  }

  private parseKeyValueOutput(output: string) {
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.includes(':'))
      .reduce<Record<string, string>>((acc, line) => {
        const [rawKey, ...rawValue] = line.split(':');
        const key = rawKey.trim().toLowerCase().replace(/\s+/g, '_');
        acc[key] = rawValue.join(':').trim();
        return acc;
      }, {});
  }

  private parseListOutput(output: string): string[] {
    return output
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  async getIntegrationStatus() {
    const manualConfigEnabled = Boolean(
      process.env.LDAP_URL &&
      process.env.LDAP_BIND_DN &&
      process.env.LDAP_BASE_DN,
    );
    const discoveryHost = process.env.AD_DISCOVERY_HOST || '127.0.0.1';

    try {
      const { stdout } = await this.runSambaTool([
        'domain',
        'info',
        discoveryHost,
      ]);
      const info = this.parseKeyValueOutput(stdout);

      return {
        mode: manualConfigEnabled ? 'manual' : 'automatic',
        source: 'samba-tool',
        sambaToolAvailable: true,
        ldapConfigured: manualConfigEnabled,
        discoveryHost,
        domainInfo: {
          realm: info.realm ?? null,
          domain: info.domain ?? null,
          netbios_name: info.netbios_name ?? null,
          server_role: info.server_role ?? null,
        },
      };
    } catch {
      return {
        mode: manualConfigEnabled ? 'manual' : 'automatic',
        source: 'fallback',
        sambaToolAvailable: false,
        ldapConfigured: manualConfigEnabled,
        discoveryHost,
        domainInfo: null,
      };
    }
  }

  async listUsers(): Promise<SambaDirectoryUser[]> {
    try {
      const { stdout } = await this.runSambaTool(['user', 'list']);
      const users = this.parseListOutput(stdout);
      return users.map((username) => ({
        id: `u-${username}`,
        displayName: username,
        samAccountName: username,
        email: `${username}@localdomain`,
        enabled: true,
        ouDn: 'OU=Users,DC=localdomain',
      }));
    } catch {
      return this.defaultUsers;
    }
  }

  async listGroups(): Promise<SambaDirectoryGroup[]> {
    try {
      const { stdout } = await this.runSambaTool(['group', 'list']);
      const groups = this.parseListOutput(stdout);
      return groups.map((groupName) => ({
        id: `g-${groupName.replace(/\s+/g, '-').toLowerCase()}`,
        name: groupName,
        description: 'Grupo sincronizado do Samba AD',
        members: [],
      }));
    } catch {
      return this.defaultGroups;
    }
  }

  async listComputers(): Promise<SambaDirectoryComputer[]> {
    try {
      const { stdout } = await this.runSambaTool(['computer', 'list']);
      const computers = this.parseListOutput(stdout);
      return computers.map((computerName) => ({
        id: `c-${computerName.replace(/\$/g, '').toLowerCase()}`,
        name: computerName.replace(/\$/g, ''),
        operatingSystem: 'Unknown',
        ouDn: 'OU=Computers,DC=localdomain',
      }));
    } catch {
      return this.defaultComputers;
    }
  }

  async listOuTree(): Promise<OuNode[]> {
    try {
      const { stdout } = await this.runSambaTool(['ou', 'list']);
      const ouDns = this.parseListOutput(stdout);
      if (ouDns.length === 0) {
        return this.defaultOuTree;
      }

      return ouDns.map((dn, index) => ({
        id: `ou-${index + 1}`,
        dn,
        name: dn.split(',')[0]?.replace('OU=', '') ?? dn,
        children: [],
      }));
    } catch {
      return this.defaultOuTree;
    }
  }
}
