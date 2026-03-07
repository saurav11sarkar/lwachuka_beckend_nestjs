import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Bookmark,
  BookmarkDocument,
} from '../bookmark/entities/bookmark.entity';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';
import {
  Property,
  PropertyDocument,
} from '../property/entities/property.entity';
import {
  Subscriber,
  SubscriberDocument,
} from '../subscriber/entities/subscriber.entity';
import { Payment, PaymentDocument } from '../payment/entities/payment.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Bookmark.name)
    private readonly bookmarModel: Model<BookmarkDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Property.name)
    private readonly propertyModel: Model<PropertyDocument>,
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async adminDashboradOverviw() {
    const user = await this.userModel.find({ role: 'user' }).countDocuments();
    const property = await this.propertyModel.countDocuments();

    const mounthRevenue = await this.paymentModel.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const thismounthRevenue = mounthRevenue[0].total;

    const activeAgent = await this.userModel
      .find({ role: 'agent', status: 'active' })
      .countDocuments();
    return { user, property, thismounthRevenue, activeAgent };
  }
}
