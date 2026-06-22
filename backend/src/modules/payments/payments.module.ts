import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { RazorpayController } from './razorpay.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { EmailModule } from '../email/email.module';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [PrismaModule, WebsocketModule, EmailModule],
  controllers: [PaymentsController, RazorpayController],
  providers: [PaymentsService, InvoiceService],
  exports: [PaymentsService, InvoiceService],
})
export class PaymentsModule {}
