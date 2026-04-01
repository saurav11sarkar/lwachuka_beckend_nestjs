import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Subscriber' })
  subscriber: mongoose.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop()
  paymentType: string;

  @Prop({ default: 'KES' })
  currency: string;

  @Prop({
    enum: ['pending', 'pending_retry', 'completed', 'failed', 'refunded'],
    default: 'pending',
  })
  status: string;

  // ─── Stripe fields ─────────────────────────────────────────
  @Prop()
  stripeSessionId?: string;

  @Prop()
  stripePaymentIntentId?: string;

  // ─── M-Pesa fields ─────────────────────────────────────────
  @Prop()
  mpesaPhoneNumber?: string;

  @Prop()
  mpesaMerchantRequestId?: string;

  @Prop()
  mpesaCheckoutRequestId?: string;

  @Prop()
  mpesaReceiptNumber?: string;

  @Prop()
  mpesaTransactionDate?: string;

  @Prop()
  mpesaResultCode?: number;

  @Prop()
  mpesaResultDesc?: string;

  @Prop({ type: Object })
  mpesaCallbackRaw?: any;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
