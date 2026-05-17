import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { PrismaModule } from './common/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { BranchesModule } from './modules/branches/branches.module';
import { OutletsModule } from './modules/outlets/outlets.module';
import { UploadModule } from './modules/upload/upload.module';
import { PositionsModule } from './modules/positions/positions.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TaskTemplatesModule } from './modules/task-templates/task-templates.module';
import { TaskGroupsModule } from './modules/task-groups/task-groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: ['.env', '../../.env'],
    }),
    PrismaModule,
    AuthModule,
    EmployeesModule,
    BranchesModule,
    OutletsModule,
    UploadModule,
    PositionsModule,
    DashboardModule,
    TaskTemplatesModule,
    TaskGroupsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
