import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module';
import { TaskGroupsController } from './task-groups.controller';
import { TaskGroupsService } from './task-groups.service';

@Module({
  imports: [PrismaModule],
  controllers: [TaskGroupsController],
  providers: [TaskGroupsService],
})
export class TaskGroupsModule {}
