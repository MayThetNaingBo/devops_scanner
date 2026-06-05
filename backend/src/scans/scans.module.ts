import { Module } from '@nestjs/common';
import { ScannerModule } from '../scanner/scanner.module';
import { ScansController } from './scans.controller';
import { ScansService } from './scans.service';
import { MailModule } from '../mail/mail.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [ScannerModule, MailModule, AiModule],
  controllers: [ScansController],
  providers: [ScansService],
})
export class ScansModule {}