import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma.module';
import { OutletsController } from './outlets.controller';
import { OutletsService } from './outlets.service';

@Module({
  imports: [PrismaModule],
  controllers: [OutletsController],
  providers: [OutletsService],
})
export class OutletsModule {}
