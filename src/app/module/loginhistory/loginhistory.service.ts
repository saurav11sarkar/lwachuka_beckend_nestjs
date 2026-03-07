import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Loginhistory,
  LoginhistoryDocument,
} from './entities/loginhistory.entity';
import { Model } from 'mongoose';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';

@Injectable()
export class LoginhistoryService {
  constructor(
    @InjectModel(Loginhistory.name)
    private readonly loginhistoryModel: Model<LoginhistoryDocument>,
  ) {}

  async getAllAduditLog(options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const result = await this.loginhistoryModel
      .find()
      .populate('userId')
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total = await this.loginhistoryModel.countDocuments();
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
}
