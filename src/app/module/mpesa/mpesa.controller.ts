import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { MpesaService } from './mpesa.service';
import { Payment } from '../payment/entities/payment.entity';
import { User } from '../user/entities/user.entity';
import { Subscriber } from '../subscriber/entities/subscriber.entity';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('mpesa')
@Controller('mpesa')
export class MpesaController {
  private readonly logger = new Logger(MpesaController.name);

  constructor(
    private readonly mpesaService: MpesaService,
    @InjectModel(Payment.name)
    private readonly paymentModel: mongoose.Model<Payment>,
    @InjectModel(User.name)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(Subscriber.name)
    private readonly subscriberModel: mongoose.Model<Subscriber>,
  ) {}

  // ─── Map M-Pesa result codes ───────────────────────────────
  private mapStatus(code: number): string {
    if (code === 0) return 'completed';
    if (code === 1037) return 'pending_retry'; // timeout
    if (code === 1032) return 'failed'; // cancelled by user
    return 'failed';
  }

  // ─── AUTOMATIC CALLBACK (Safaricom calls this automatically) ─
  // In sandbox: use Daraja Simulator to trigger
  // In production: Safaricom calls this automatically after user enters PIN
  @Post('callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle M-Pesa callback' })
  async callback(@Body() body: any) {
    // ✅ Always respond OK immediately (Safaricom requirement — must reply within 5s)
    const parsed = this.mpesaService.parseStkCallback(body);
    if (!parsed) return { ResultCode: 0, ResultDesc: 'Accepted' };

    this.logger.log(
      `Callback received → CheckoutID: ${parsed.checkoutRequestId} | Code: ${parsed.resultCode}`,
    );

    // ─── Find payment by CheckoutRequestID ───────────────────
    const pay = await this.paymentModel.findOne({
      mpesaCheckoutRequestId: parsed.checkoutRequestId,
    });

    if (!pay) {
      this.logger.warn(`Payment not found for: ${parsed.checkoutRequestId}`);
      return { ResultCode: 0, ResultDesc: 'Accepted' };
    }

    // ─── Idempotency check (ignore duplicate callbacks) ───────
    if (pay.status === 'completed') {
      this.logger.log(
        `Duplicate callback ignored for: ${parsed.checkoutRequestId}`,
      );
      return { ResultCode: 0, ResultDesc: 'Accepted' };
    }

    // ─── Update payment record ────────────────────────────────
    const newStatus = this.mapStatus(parsed.resultCode);

    await this.paymentModel.findByIdAndUpdate(pay._id, {
      status: newStatus,
      mpesaResultCode: parsed.resultCode,
      mpesaResultDesc: parsed.resultDesc,
      mpesaReceiptNumber: parsed.mpesaReceiptNumber,
      mpesaTransactionDate: parsed.transactionDate,
      mpesaCallbackRaw: parsed.raw,
    });

    // ─── On success: activate subscription ───────────────────
    if (parsed.resultCode === 0) {
      await this.activateSubscription(pay._id.toString());
    }

    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }

  // ─── Activate user subscription after successful payment ───
  private async activateSubscription(paymentId: string) {
    try {
      const payment = await this.paymentModel.findById(paymentId);
      if (!payment?.subscriber || !payment?.user) return;

      const sub = await this.subscriberModel.findById(payment.subscriber);
      if (!sub) return;

      // Calculate subscription end date
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + sub.days);

      // Update user
      await this.userModel.findByIdAndUpdate(payment.user, {
        isSubscribed: true,
        subscribers: sub._id,
        subscriptionEndDate: endDate,
        status: 'active',
      });

      // Add user to subscriber.users (no duplicates)
      await this.subscriberModel.findByIdAndUpdate(sub._id, {
        $addToSet: { users: payment.user },
      });

      this.logger.log(
        `✅ Subscription activated → User: ${payment.user} | Plan: ${sub.name} | Expires: ${endDate}`,
      );
    } catch (err: any) {
      this.logger.error(`activateSubscription error: ${err.message}`);
    }
  }
}
