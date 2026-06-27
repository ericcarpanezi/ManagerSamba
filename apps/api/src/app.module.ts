import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DirectoryModule } from './directory/directory.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { ComputersModule } from './computers/computers.module';
import { OusModule } from './ous/ous.module';
import { AuditModule } from './audit/audit.module';
import { RealtimeModule } from './realtime/realtime.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    DirectoryModule,
    UsersModule,
    GroupsModule,
    ComputersModule,
    OusModule,
    AuditModule,
    RealtimeModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
