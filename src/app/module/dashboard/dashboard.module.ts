import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Bookmark, BookmarkSchema } from '../bookmark/entities/bookmark.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { Property, PropertySchema } from '../property/entities/property.entity';
import { Payment, PaymentSchema } from '../payment/entities/payment.entity';
import {
  ContactProperty,
  ContactPropertySchema,
} from '../contactproprety/entities/contactproprety.entity';
import { Calender, CalenderSchema } from '../calender/entities/calender.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: User.name, schema: UserSchema },
      { name: Property.name, schema: PropertySchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: ContactProperty.name, schema: ContactPropertySchema },
      { name: Calender.name, schema: CalenderSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
