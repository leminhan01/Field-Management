import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module';
import { TaskAssignmentsController } from './task-assignments.controller';
import { TaskAssignmentsService } from './task-assignments.service';

@Module({
  imports: [PrismaModule],
  controllers: [TaskAssignmentsController],
  providers: [TaskAssignmentsService],
})
export class TaskAssignmentsModule {}
