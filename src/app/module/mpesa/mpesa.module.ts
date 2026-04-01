import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { MpesaService } from './mpesa.service';
import { MpesaController } from './mpesa.controller';
import { Payment, PaymentSchema } from '../payment/entities/payment.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import {
  Subscriber,
  SubscriberSchema,
} from '../subscriber/entities/subscriber.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: User.name, schema: UserSchema },
      { name: Subscriber.name, schema: SubscriberSchema },
    ]),
  ],
  controllers: [MpesaController],
  providers: [MpesaService],
  exports: [MpesaService], // ✅ exported so SubscriberModule can use it
})
export class MpesaModule {}
