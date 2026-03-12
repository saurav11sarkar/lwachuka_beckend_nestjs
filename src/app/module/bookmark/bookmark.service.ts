import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Bookmark, BookmarkDocument } from './entities/bookmark.entity';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';
import {
  Property,
  PropertyDocument,
} from '../property/entities/property.entity';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import {
  RecentActivity,
  RecentActivityDocument,
} from '../recent-activity/entities/recent-activity.entity';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectModel(Bookmark.name)
    private readonly bookmarkModel: Model<BookmarkDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Property.name)
    private readonly propertyModel: Model<PropertyDocument>,
    @InjectModel(RecentActivity.name)
    private readonly recentActivityModel: Model<RecentActivityDocument>,
  ) {}

  async createBookmark(userId: string, propertyId: string) {
    const user = await this.userModel.findById(userId);

    if (!user)
      throw new HttpException('User is not found', HttpStatus.NOT_FOUND);

    const property = await this.propertyModel.findById(propertyId);

    if (!property)
      throw new HttpException('Property is not found', HttpStatus.NOT_FOUND);

    const result = await this.bookmarkModel.create({
      user: userId,
      property: propertyId,
    });

    property.bookmarkUser.push(user._id);
    await property.save();

    await this.recentActivityModel.create({
      user: user._id,
      property: property._id,
      activityType: 'saved_property',
      description: `You saved the property ${property.title} to your bookmarks.`,
    });

    return result;
  }

  async getMyBookmark(
    userId: string,
    params: IFilterParams,
    options: IOptions,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user)
      throw new HttpException('User is not found', HttpStatus.NOT_FOUND);

    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const { searchTerm, ...filterData } = params;
    const andCondition: any[] = [];
    const searchAbleFields = ['property.title', 'property.listingType'];

    if (searchTerm) {
      andCondition.push({
        $or: searchAbleFields.map((field) => ({
          [field]: { $regex: searchTerm, $options: 'i' },
        })),
      });
    }

    if (Object.keys(filterData).length > 0) {
      andCondition.push({
        $and: Object.entries(filterData).map(([key, value]) => ({
          [key]: value,
        })),
      });
    }

    andCondition.push({
      user: user._id,
    });

    const whereCondition =
      andCondition.length > 0 ? { $and: andCondition } : {};

    const result = await this.bookmarkModel
      .find(whereCondition)
      .populate('property')
      .populate('user')
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);

    const total = await this.bookmarkModel.countDocuments(whereCondition);

    return { result, meta: { total, limit, page } };
  }

  async removeBookmark(userId: string, propertyId: string) {
    const user = await this.userModel.findById(userId);

    if (!user)
      throw new HttpException('User is not found', HttpStatus.NOT_FOUND);

    const property = await this.propertyModel.findById(propertyId);

    if (!property)
      throw new HttpException('Property is not found', HttpStatus.NOT_FOUND);

    const bookmark = await this.bookmarkModel.findOne({
      user: user._id,
      property: property._id,
    });

    if (!bookmark)
      throw new HttpException('Bookmark is not found', HttpStatus.NOT_FOUND);

    if (bookmark.user.toString() !== user._id.toString())
      throw new HttpException(
        'You are not authorized to remove this bookmark',
        HttpStatus.UNAUTHORIZED,
      );

    const result = await this.bookmarkModel.findByIdAndDelete(bookmark._id);

    property.bookmarkUser = property.bookmarkUser.filter(
      (id) => id.toString() !== user._id.toString(),
    );
    await property.save();

    await this.recentActivityModel.create({
      user: user._id,
      property: property._id,
      activityType: 'remove_saved_property',
      description: `You removed the property ${property.title} from your bookmarks.`,
    });

    return result;
  }
}
