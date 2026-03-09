import { HttpException, Injectable } from '@nestjs/common';
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
import { Payment, PaymentDocument } from '../payment/entities/payment.entity';
import {
  ContactProperty,
  ContactPropertyDocument,
} from '../contactproprety/entities/contactproprety.entity';
import { Calender, CalenderDocument } from '../calender/entities/calender.entity';

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
    @InjectModel(ContactProperty.name)
    private readonly contactPropertyModel: Model<ContactPropertyDocument>,
    @InjectModel(Calender.name)
    private readonly calenderModel: Model<CalenderDocument>,
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

  async analyticsReports() {
    const totalUsers = await this.userModel.countDocuments();

    const totalProperties = await this.propertyModel.countDocuments({
      status: 'approved',
    });

    const revenueData = await this.paymentModel.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
        },
      },
    ]);

    const totalRevenue = revenueData[0]?.totalRevenue || 0;

    const lastMonthUsers = await this.userModel.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      },
    });

    const previousMonthUsers = await this.userModel.countDocuments({
      createdAt: {
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 2)),
        $lt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      },
    });

    const growthRate =
      previousMonthUsers === 0
        ? 0
        : ((lastMonthUsers - previousMonthUsers) / previousMonthUsers) * 100;

    const userTrend = await this.userModel.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          users: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const revenueTrend = await this.paymentModel.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const propertyGrowth = await this.propertyModel.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          properties: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const propertyByType = await this.propertyModel.aggregate([
      {
        $group: {
          _id: '$propertyType',
          total: { $sum: 1 },
        },
      },
    ]);

    return {
      cards: {
        userGrowthRate: Number(growthRate.toFixed(2)),
        totalUsers,
        totalProperties,
        totalRevenue,
      },

      charts: {
        userTrend,
        revenueTrend,
        propertyGrowth,
        propertyByType,
      },
    };
  }

  async userDashboardOverview(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('User is not found', 404);

    const savedProperties = await this.bookmarModel.countDocuments({
      user: userId,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcommingSiteVisit = await this.calenderModel.countDocuments({
      user: user._id,
      status: 'approved',
      moveInData: { $gte: today },
    });

    const totalInquiries = await this.contactPropertyModel.countDocuments({
      userId: user._id,
    });

    return {
      savedProperties,
      upcommingSiteVisit,
      totalInquiries,
    };
  }

  async agentDashboardOverview(userId: string, year?: number) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('User is not found', 404);

    const selectedYear = year || new Date().getFullYear();

    const totalProperty = await this.propertyModel.countDocuments({
      createBy: user._id,
    });
    const activeProperty = await this.propertyModel.countDocuments({
      createBy: user._id,
      status: 'approved',
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const properties = await this.propertyModel.find(
      { createBy: user._id },
      { _id: 1 },
    );
    const propertyIds = properties.map((property) => property._id);

    const upCommingSiteViste = await this.calenderModel.countDocuments({
      property: { $in: propertyIds },
      status: 'approved',
      moveInData: { $gte: today },
    });

    const startDate = new Date(selectedYear, 0, 1);
    const endDate = new Date(selectedYear + 1, 0, 1);

    const monthlyListingsRaw = await this.propertyModel.aggregate([
      {
        $match: {
          createBy: user._id,
          createdAt: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const monthLabels = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];

    const totalListingsByMonth = monthLabels.map((month, index) => {
      const foundMonth = monthlyListingsRaw.find(
        (item) => item._id === index + 1,
      );

      return {
        month,
        total: foundMonth?.total || 0,
      };
    });

    return {
      totalProperty,
      activeProperty,
      upCommingSiteViste,
      selectedYear,
      totalListingsByMonth,
    };
  }
}
