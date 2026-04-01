import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriberController } from './subscriber.controller';
import { SubscriberService } from './subscriber.service';
import { Subscriber, SubscriberSchema } from './entities/subscriber.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { Payment, PaymentSchema } from '../payment/entities/payment.entity';
import { MpesaModule } from '../mpesa/mpesa.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Subscriber.name, schema: SubscriberSchema },
      { name: User.name, schema: UserSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
    MpesaModule, // ✅ IMPORTANT
  ],
  controllers: [SubscriberController],
  providers: [SubscriberService],
})
export class SubscriberModule {}
