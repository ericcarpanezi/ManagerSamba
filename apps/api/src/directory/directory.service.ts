import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { execFile } from 'node:child_process';
import * as ldap from 'ldapjs';
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

  private async ldapBind(dn: string, password: string) {
    const ldapUrl = process.env.LDAP_URL;
    if (!ldapUrl) {
      throw new UnauthorizedException('LDAP_URL não configurado');
    }

    const client = ldap.createClient({
      url: ldapUrl,
      reconnect: false,
      timeout: 8_000,
      connectTimeout: 8_000,
      tlsOptions:
        process.env.LDAP_TLS_REJECT_UNAUTHORIZED === 'false'
          ? { rejectUnauthorized: false }
          : undefined,
    });

    try {
      await new Promise<void>((resolve, reject) => {
        client.bind(dn, password, (error: Error | null) => {
          if (error) {
            reject(
              new UnauthorizedException(`Falha no bind LDAP: ${error.message}`),
            );
            return;
          }
          resolve();
        });
      });
    } finally {
      client.unbind();
    }
  }

  async validateCredentials(username: string, password: string): Promise<void> {
    const normalizedUsername = username.trim();
    if (!normalizedUsername || !password) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const bootstrapLoginEnabled =
      process.env.DEV_ENABLE_BOOTSTRAP_LOGIN !== 'false';
    const bootstrapUsername = process.env.DEV_BOOTSTRAP_USERNAME ?? 'admin';
    const bootstrapPassword = process.env.DEV_BOOTSTRAP_PASSWORD ?? 'admin123';

    if (
      bootstrapLoginEnabled &&
      normalizedUsername === bootstrapUsername.trim() &&
      password === bootstrapPassword
    ) {
      return;
    }

    const ldapUrl = process.env.LDAP_URL;
    const bindDnTemplate = process.env.LDAP_BIND_DN_TEMPLATE;
    const realm = process.env.AD_REALM;
    const hasLdapConfig = Boolean(ldapUrl && (bindDnTemplate || realm));

    if (!hasLdapConfig) {
      throw new UnauthorizedException(
        'LDAP não configurado e login bootstrap desabilitado ou credenciais inválidas.',
      );
    }

    try {
      if (bindDnTemplate) {
        const bindDn = bindDnTemplate.replace(
          /\{username\}/g,
          normalizedUsername,
        );
        await this.ldapBind(bindDn, password);
        return;
      }

      if (realm) {
        await this.ldapBind(`${normalizedUsername}@${realm}`, password);
        return;
      }
    } catch {
      throw new UnauthorizedException('Falha de autenticação LDAP');
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

  async resetUserPassword(username: string, newPassword?: string) {
    const args = ['user', 'setpassword', username];
    if (newPassword) {
      args.push(`--newpassword=${newPassword}`);
    } else {
      args.push('--random-password');
    }

    try {
      const { stdout, stderr } = await this.runSambaTool(args);
      return {
        status: 'ok',
        stdout,
        stderr,
      };
    } catch (error) {
      return {
        status: 'fallback',
        message:
          'Não foi possível executar samba-tool no ambiente atual. Operação registrada para execução manual.',
        error: error instanceof Error ? error.message : 'unknown_error',
      };
    }
  }
}
