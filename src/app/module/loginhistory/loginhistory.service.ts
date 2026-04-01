import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Loginhistory,
  LoginhistoryDocument,
} from './entities/loginhistory.entity';
import { Model } from 'mongoose';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import { IFilterParams } from 'src/app/helper/pick';

@Injectable()
export class LoginhistoryService {
  constructor(
    @InjectModel(Loginhistory.name)
    private readonly loginhistoryModel: Model<LoginhistoryDocument>,
  ) {}

  async getAllAduditLog(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { searchTerm, ...filterData } = params;
    const andCondition: any[] = [];
    const searchAbleFields = ['status'];

    if (searchTerm) {
      andCondition.push({
        $or: searchAbleFields.map((field) => ({
          [field]: {
            $regex: searchTerm,
            $options: 'i',
          },
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

    const whereConditions =
      andCondition.length > 0 ? { $and: andCondition } : {};
    const result = await this.loginhistoryModel
      .find(whereConditions)
      .populate('userId')
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total = await this.loginhistoryModel.countDocuments(whereConditions);
    return {
      data: result,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async getSingleAuditLog(id: string) {
    const result = await this.loginhistoryModel.findById(id).populate('userId');
    if (!result)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return result;
  }

  async deleteAuditLog(id: string) {
    const result = await this.loginhistoryModel.findByIdAndDelete(id);
    if (!result)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    return result;
  }

  async overViewAuditlog() {
    const totalEvent = await this.loginhistoryModel.countDocuments();
    const totalSuccess = await this.loginhistoryModel.countDocuments({
      status: 'success',
    });

    const totalFail = await this.loginhistoryModel.countDocuments({
      status: 'failed',
    });
    const totalBlack = await this.loginhistoryModel.countDocuments({
      status: 'blocked',
    });
    return { totalEvent, totalSuccess, totalFail, totalBlack };
  }
}
