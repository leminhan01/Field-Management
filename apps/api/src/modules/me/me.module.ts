import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { UploadModule } from '../upload/upload.module';
import { SurveysModule } from '../surveys/surveys.module';

@Module({
  imports: [UploadModule, SurveysModule],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
