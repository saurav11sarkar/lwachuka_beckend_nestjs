import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhookService } from './webhook.service';
import { WebhookController } from './webhook.controller';
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
  controllers: [WebhookController],
  providers: [WebhookService],
})
export class WebhookModule {}
