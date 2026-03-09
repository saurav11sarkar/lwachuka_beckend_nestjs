import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCalenderDto } from './dto/create-calender.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Calender, CalenderDocument } from './entities/calender.entity';
import { Model } from 'mongoose';
import {
  Property,
  PropertyDocument,
} from '../property/entities/property.entity';
import { User, UserDocument } from '../user/entities/user.entity';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import { UpdateCalenderDto } from './dto/update-calender.dto';

@Injectable()
export class CalenderService {
  constructor(
    @InjectModel(Calender.name)
    private calenderModel: Model<CalenderDocument>,

    @InjectModel(Property.name)
    private propertyModel: Model<PropertyDocument>,

    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  private async syncExpiredApprovedVisits() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await this.calenderModel.updateMany(
      {
        status: 'approved',
        moveInData: { $lt: today },
      },
      {
        $set: { status: 'completed' },
      },
    );
  }

  async createCalender(
    userId: string,
    createCalenderDto: CreateCalenderDto,
    propertyId: string,
  ) {
    const user = await this.userModel.findById(userId);
    const property = await this.propertyModel.findById(propertyId);
    if (!user || !property) {
      throw new Error('User or property not found');
    }
    const result = await this.calenderModel.create({
      ...createCalenderDto,
      user: user._id,
      property: property._id,
    });
    return result;
  }

  async getMyBookCalender(
    userId: string,
    params: IFilterParams,
    options: IOptions,
  ) {
    await this.syncExpiredApprovedVisits();

    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { searchTerm, ...filterData } = params;

    const andConditions: any[] = [];

    const searchAbleFields = [
      'firstName',
      'lastName',
      'email',
      'customMessage',
      'phone',
    ];

    if (searchTerm) {
      andConditions.push({
        $or: searchAbleFields.map((field) => ({
          [field]: {
            $regex: searchTerm,
            $options: 'i',
          },
        })),
      });
    }

    if (Object.keys(filterData).length > 0) {
      andConditions.push({
        $and: Object.entries(filterData).map(([key, value]) => ({
          [key]: value,
        })),
      });
    }

    andConditions.push({
      user: userId,
    });

    const whereConditions =
      andConditions.length > 0 ? { $and: andConditions } : {};

    const result = await this.calenderModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'property',
        select: 'title images location',
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email phone',
      });
    const total = await this.calenderModel.countDocuments(whereConditions);

    return {
      data: result,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async getMyAgentBookCalender(
    userId: string,
    params: IFilterParams,
    options: IOptions,
  ) {
    await this.syncExpiredApprovedVisits();

    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { searchTerm, ...filterData } = params;

    const agent = await this.userModel.findById(userId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    const properties = await this.propertyModel.find({
      createBy: agent._id,
    });

    const andConditions: any[] = [];

    const searchAbleFields = [
      'firstName',
      'lastName',
      'email',
      'customMessage',
      'phone',
    ];

    if (searchTerm) {
      andConditions.push({
        $or: searchAbleFields.map((field) => ({
          [field]: {
            $regex: searchTerm,
            $options: 'i',
          },
        })),
      });
    }

    if (Object.keys(filterData).length > 0) {
      andConditions.push({
        $and: Object.entries(filterData).map(([key, value]) => ({
          [key]: value,
        })),
      });
    }

    andConditions.push({
      property: { $in: properties.map((property) => property._id) },
    });

    const whereConditions =
      andConditions.length > 0 ? { $and: andConditions } : {};

    const result = await this.calenderModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'property',
        select: 'title images location',
      })
      .populate({
        path: 'user',
        select: 'firstName lastName email phone',
      });
    const total = await this.calenderModel.countDocuments(whereConditions);

    return {
      data: result,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async getMyCalenderById(id: string) {
    await this.syncExpiredApprovedVisits();

    const calender = await this.calenderModel.findById(id);
    if (!calender) {
      throw new HttpException('Calender not found', HttpStatus.NOT_FOUND);
    }
    return calender;
  }

  async updateCalender(
    userId: string,
    id: string,
    updateCalenderDto: UpdateCalenderDto,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const calender = await this.calenderModel.findById(id);
    if (!calender) {
      throw new HttpException('Calender not found', HttpStatus.NOT_FOUND);
    }

    if (calender.user.toString() !== user._id.toString()) {
      throw new HttpException(
        'You are not authorized to update this calender',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const result = await this.calenderModel.findByIdAndUpdate(
      id,
      updateCalenderDto,
      { new: true },
    );
    return result;
  }

  async deleteCalender(userId: string, id: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const calender = await this.calenderModel.findById(id);
    if (!calender) {
      throw new HttpException('Calender not found', HttpStatus.NOT_FOUND);
    }

    if (calender.user.toString() !== user._id.toString()) {
      throw new HttpException(
        'You are not authorized to delete this calender',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const result = await this.calenderModel.findByIdAndDelete(id);
    return result;
  }

  async updateVisitStatus(id: string, status: string) {
    const visit = await this.calenderModel.findById(id);

    if (!visit) {
      throw new HttpException('Visit not found', 404);
    }

    visit.status = status;

    await visit.save();

    return visit;
  }

  async getVisitStats(userId: string, role: string) {
    await this.syncExpiredApprovedVisits();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (role === 'user') {
      const [upcoming, completed, pending, cancelled] = await Promise.all([
        this.calenderModel.countDocuments({
          user: userId,
          status: 'approved',
          moveInData: { $gte: today },
        }),

        this.calenderModel.countDocuments({
          user: userId,
          status: 'completed',
        }),

        this.calenderModel.countDocuments({
          user: userId,
          status: 'pending',
        }),

        this.calenderModel.countDocuments({
          user: userId,
          status: 'cancelled',
        }),
      ]);

      return {
        upcoming,
        completed,
        pending,
        cancelled,
      };
    }

    const properties = await this.propertyModel.find({
      createBy: userId,
    });

    const propertyIds = properties.map((p) => p._id);

    const [upcoming, completed, pending, cancelled] = await Promise.all([
      this.calenderModel.countDocuments({
        property: { $in: propertyIds },
        status: 'approved',
        moveInData: { $gte: today },
      }),

      this.calenderModel.countDocuments({
        property: { $in: propertyIds },
        status: 'completed',
      }),

      this.calenderModel.countDocuments({
        property: { $in: propertyIds },
        status: 'pending',
      }),

      this.calenderModel.countDocuments({
        property: { $in: propertyIds },
        status: 'cancelled',
      }),
    ]);

    return {
      upcoming,
      completed,
      pending,
      cancelled,
    };
  }

  async getAllUpcomingVisits(userId: string) {
    await this.syncExpiredApprovedVisits();

    const today = new Date();
    today.setHours(0, 0, 0, 0); // start of today

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const visits = await this.calenderModel
      .find({
        user: user._id,
        status: 'approved',
        moveInData: { $gte: today },
      })
      .populate('user', 'firstName lastName email profileImage')
      .populate('property', 'title location price')
      .sort({ moveInData: 1 });

    return {
      total: visits.length,
      data: visits,
    };
  }
}
