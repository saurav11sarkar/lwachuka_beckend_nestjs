import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment, PaymentDocument } from './entities/payment.entity';
import mongoose from 'mongoose';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: mongoose.Model<PaymentDocument>,
  ) {}

  async getAllPayments(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { searchTerm, ...filterData } = params;

    const andCondition: any[] = [];
    const searchAbleFields = ['currency', 'status', 'paymentType'];

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

    const result = await this.paymentModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total = await this.paymentModel.countDocuments(whereConditions);

    return {
      data: result,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async getMyPayments(
    userId: string,
    params: IFilterParams,
    options: IOptions,
  ) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { searchTerm, ...filterData } = params;

    const andCondition: any[] = [];
    const searchAbleFields = ['currency', 'status', 'paymentType'];

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
    andCondition.push({
      user: userId,
    });

    const whereConditions =
      andCondition.length > 0 ? { $and: andCondition } : {};

    const result = await this.paymentModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total = await this.paymentModel.countDocuments(whereConditions);

    return {
      data: result,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async getSinglePayment(id: string) {
    const result = await this.paymentModel.findById(id);
    return {
      message: 'Payment retrieved successfully',
      data: result,
    };
  }

  async paymentManagemant() {
    const result = await this.paymentModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    const pendingAmount = result.find((item) => item._id === 'pending') || {
      _id: 'pending',
      count: 0,
      totalAmount: 0,
    };
    const completedAmount = result.find((item) => item._id === 'completed') || {
      _id: 'pending',
      count: 0,
      totalAmount: 0,
    };

    const totalTensations = await this.paymentModel.estimatedDocumentCount();
    const totalFaildTencations = await this.paymentModel.countDocuments({
      status: 'failed',
    });

    return {
      totalTensations,
      totalFaildTencations,
      pendingAmount: pendingAmount.totalAmount,
      completedAmount: completedAmount.totalAmount,
    };
  }
}
