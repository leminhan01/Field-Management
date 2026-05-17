import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module';
import { TaskTemplatesController } from './task-templates.controller';
import { TaskTemplatesService } from './task-templates.service';

@Module({
  imports: [PrismaModule],
  controllers: [TaskTemplatesController],
  providers: [TaskTemplatesService],
  exports: [TaskTemplatesService],
})
export class TaskTemplatesModule {}
