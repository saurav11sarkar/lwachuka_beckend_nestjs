import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  RecentActivity,
  RecentActivityDocument,
} from './entities/recent-activity.entity';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';
import {
  Property,
  PropertyDocument,
} from '../property/entities/property.entity';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';

@Injectable()
export class RecentActivityService {
  constructor(
    @InjectModel(RecentActivity.name)
    private readonly recentActivityModel: Model<RecentActivityDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async getAllMyRecentActivities(
    userId: string,
    params: IFilterParams,
    options: IOptions,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('User is not found', 404);
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { searchTerm, ...filterData } = params;

    const andConditions: any[] = [];

    const searchAbleFields = ['title', 'activityType', 'description'];
    if (searchTerm) {
      andConditions.push({
        $or: searchAbleFields.map((field) => ({
          [field]: { $regex: searchTerm, $options: 'i' },
        })),
      });
    }

    if (Object.keys(filterData).length) {
      andConditions.push({
        $and: Object.entries(filterData).map(([key, value]) => ({
          [key]: value,
        })),
      });
    }
    andConditions.push({ user: userId });

    const whereCondition =
      andConditions.length > 1 ? { $and: andConditions } : andConditions[0];

    const result = await this.recentActivityModel
      .find(whereCondition)
      .populate('property')
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total = await this.recentActivityModel.countDocuments(whereCondition);
    return {
      data: result,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async getSingleRecentActivity(id: string) {
    const activity = await this.recentActivityModel
      .findById(id)
      .populate('property');

    if (!activity) throw new HttpException('Recent activity is not found', 404);
    return activity;
  }

  async deleteRecentActivity(id: string) {
    const activity = await this.recentActivityModel.findByIdAndDelete(id);
    if (!activity) throw new HttpException('Recent activity is not found', 404);
    return activity;
  }
}
