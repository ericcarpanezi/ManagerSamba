import { Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DirectoryService } from '../directory/directory.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUser } from './types/auth-user';

const DEFAULT_PERMISSIONS = [
  { key: 'users:read', description: 'Visualizar usuários' },
  { key: 'users:write', description: 'Gerenciar usuários' },
  { key: 'groups:read', description: 'Visualizar grupos' },
  { key: 'groups:write', description: 'Gerenciar grupos' },
  { key: 'computers:read', description: 'Visualizar computadores' },
  { key: 'computers:write', description: 'Gerenciar computadores' },
  { key: 'ous:read', description: 'Visualizar OUs' },
  { key: 'ous:write', description: 'Gerenciar OUs' },
  { key: 'audit:read', description: 'Visualizar auditoria' },
  { key: 'audit:write', description: 'Escrever auditoria' },
  { key: 'directory:read', description: 'Visualizar status de diretório' },
];

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly jwtService: JwtService,
    private readonly directoryService: DirectoryService,
    private readonly prismaService: PrismaService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.bootstrapDefaultRbac();
  }

  private async bootstrapDefaultRbac() {
    await Promise.all(
      DEFAULT_PERMISSIONS.map((permission) =>
        this.prismaService.permission.upsert({
          where: { key: permission.key },
          update: { description: permission.description },
          create: permission,
        }),
      ),
    );

    const permissions = await this.prismaService.permission.findMany();
    const permissionIdsByKey = new Map(
      permissions.map((permission) => [permission.key, permission.id]),
    );

    const roles = [
      {
        name: 'admin',
        description: 'Administrador completo da plataforma',
        permissions: permissions.map((permission) => permission.key),
      },
      {
        name: 'operator',
        description: 'Operação padrão de diretório',
        permissions: [
          'users:read',
          'users:write',
          'groups:read',
          'groups:write',
          'computers:read',
          'computers:write',
          'ous:read',
          'ous:write',
          'directory:read',
        ],
      },
      {
        name: 'auditor',
        description: 'Acesso de auditoria e leitura',
        permissions: [
          'users:read',
          'groups:read',
          'computers:read',
          'ous:read',
          'audit:read',
          'directory:read',
        ],
      },
    ];

    for (const role of roles) {
      const storedRole = await this.prismaService.role.upsert({
        where: { name: role.name },
        update: { description: role.description },
        create: {
          name: role.name,
          description: role.description,
        },
      });

      await this.prismaService.rolePermission.deleteMany({
        where: { roleId: storedRole.id },
      });

      const rolePermissionsData = role.permissions
        .map((permissionKey) => permissionIdsByKey.get(permissionKey))
        .filter((permissionId): permissionId is string => Boolean(permissionId))
        .map((permissionId) => ({
          roleId: storedRole.id,
          permissionId,
        }));

      if (rolePermissionsData.length > 0) {
        await this.prismaService.rolePermission.createMany({
          data: rolePermissionsData,
        });
      }
    }
  }

  async login(username: string, password: string) {
    await this.directoryService.validateCredentials(username, password);

    const profile = await this.prismaService.userProfile.upsert({
      where: { samAccountName: username },
      update: {},
      create: {
        samAccountName: username,
        displayName: username,
      },
      include: {
        profileRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (profile.profileRoles.length === 0) {
      const operatorRole = await this.prismaService.role.findUnique({
        where: { name: 'operator' },
      });

      if (operatorRole) {
        await this.prismaService.profileRole.create({
          data: {
            profileId: profile.id,
            roleId: operatorRole.id,
          },
        });
      }
    }

    const hydratedProfile = await this.prismaService.userProfile.findUnique({
      where: { samAccountName: username },
      include: {
        profileRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const roles =
      hydratedProfile?.profileRoles.map(
        (profileRole) => profileRole.role.name,
      ) ?? [];
    const permissions = Array.from(
      new Set(
        hydratedProfile?.profileRoles.flatMap((profileRole) =>
          profileRole.role.rolePermissions.map(
            (rolePermission) => rolePermission.permission.key,
          ),
        ) ?? [],
      ),
    );

    const payload = {
      sub: username,
      roles,
      permissions,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        username,
        roles,
        permissions,
      },
    };
  }

  me(user: AuthUser) {
    return {
      username: user.username,
      roles: user.roles,
      permissions: user.permissions,
    };
  }
}
