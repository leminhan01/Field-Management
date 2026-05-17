import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('upload')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ) {
    const result = await this.uploadService.uploadImage(file, folder || 'fieldapp');
    return result;
  }
}
