import { HttpException, Injectable } from '@nestjs/common';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Faq, FaqDocument } from './entities/faq.entity';
import { Model } from 'mongoose';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';

@Injectable()
export class FaqService {
  constructor(
    @InjectModel(Faq.name) private readonly faqmodel: Model<FaqDocument>,
  ) {}

  async createFaq(createFaqDto: CreateFaqDto) {
    const faq = await this.faqmodel.create(createFaqDto);
    if (!faq) throw new HttpException('Faq create failed', 400);

    return faq;
  }

  async getAllFaq(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const { searchTerm, ...filterData } = params;
    const andCondition: any[] = [];

    const searchAbleFields = ['question', 'answer'];

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

    const whenCondition = andCondition.length > 0 ? { $and: andCondition } : {};

    const result = await this.faqmodel
      .find(whenCondition)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);

    const total = await this.faqmodel.countDocuments(whenCondition);

    return {
      data: result,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async getSingleFaq(id: string) {
    const result = await this.faqmodel.findById(id);
    if (!result) throw new HttpException('Faq is not found', 404);

    return result;
  }

  async updateFaq(id: string, updateFaqDto: UpdateFaqDto) {
    const result = await this.faqmodel.findByIdAndUpdate(id, updateFaqDto, {
      new: true,
    });
    if (!result) throw new HttpException('Faq update failed', 400);

    return result;
  }
  async deleteFaq(id: string) {
    const result = await this.faqmodel.findByIdAndDelete(id);
    if (!result) throw new HttpException('Faq delete failed', 400);

    return result;
  }
}
