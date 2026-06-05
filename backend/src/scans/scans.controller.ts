import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateScanDto } from './dto/create-scan.dto';
import { ScansService } from './scans.service';
import { ApiBearerAuth } from '@nestjs/swagger';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email: string;
    role: string;
  };
};

@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('scans')
export class ScansController {
  constructor(private readonly scansService: ScansService) {}

  @Post()
  createScan(@Body() dto: CreateScanDto, @Req() req: AuthenticatedRequest) {
    return this.scansService.createScan(dto, req.user);
  }

  @Get()
  getMyScans(@Req() req: AuthenticatedRequest) {
    return this.scansService.getMyScans(req.user.id);
  }

  @Get(':id')
  getMyScanById(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.scansService.getMyScanById(id, req.user.id);
  }
}