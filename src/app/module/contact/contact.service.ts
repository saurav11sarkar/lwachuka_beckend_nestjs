import { HttpException, Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Contact, ContactDocument } from './entities/contact.entity';
import { Model } from 'mongoose';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import { IFilterParams } from 'src/app/helper/pick';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactService {
  constructor(
    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,
  ) {}

  async createContact(createContactDto: CreateContactDto) {
    const result = await this.contactModel.create(createContactDto);
    return result;
  }

  async getContacts(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);

    const { searchTerm, ...filterData } = params;

    const andCondition: any[] = [];
    const searchAbleFields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'message',
    ];

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

    const result = await this.contactModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total = await this.contactModel.countDocuments(whereConditions);

    return {
      data: result,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async getSingleContact(id: string) {
    const result = await this.contactModel.findById(id);
    if (!result) throw new HttpException('Contact not found', 404);
    return result;
  }

  async updateContact(id: string, payload: UpdateContactDto) {
    const result = await this.contactModel.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });
    if (!result) throw new HttpException('Contact not found', 404);
    return result;
  }

  async deleteContact(id: string) {
    const result = await this.contactModel.findByIdAndDelete(id);
    if (!result) throw new HttpException('Contact not found', 404);
    return result;
  }
}
