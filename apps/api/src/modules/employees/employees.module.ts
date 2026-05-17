import { Module } from '@nestjs/common';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { UploadService } from '../upload/upload.service';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService, UploadService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
