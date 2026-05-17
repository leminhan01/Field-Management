import { Controller, Get, UseGuards } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('branches')
@UseGuards(JwtAuthGuard)
export class BranchesController {
  constructor(private branchesService: BranchesService) {}

  @Get()
  findAll() {
    return this.branchesService.findAll();
  }
}
