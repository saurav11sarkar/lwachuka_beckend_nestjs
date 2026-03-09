import { HttpException, Injectable } from '@nestjs/common';
import { CreateContactpropretyDto } from './dto/create-contactproprety.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  ContactProperty,
  ContactPropertyDocument,
} from './entities/contactproprety.entity';
import { Model, Types } from 'mongoose';
import {
  Property,
  PropertyDocument,
} from '../property/entities/property.entity';
import { User, UserDocument } from '../user/entities/user.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';

@Injectable()
export class ContactpropretyService {
  constructor(
    @InjectModel(ContactProperty.name)
    private contactPropertyModel: Model<ContactPropertyDocument>,

    @InjectModel(Property.name)
    private propertyModel: Model<PropertyDocument>,

    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  // User first contact
  async createContactProperty(
    userId: string,
    dto: CreateContactpropretyDto,
    propertyId: string,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('User not found', 404);

    const property = await this.propertyModel.findById(propertyId);
    if (!property) throw new HttpException('Property not found', 404);

    if (!property.createBy) {
      throw new HttpException('Property owner not found', 400);
    }

    const contact = await this.contactPropertyModel.create({
      userId: user._id,
      propertyId: property._id,
      propertyOwnerId: property.createBy,
      messages: [
        {
          senderId: user._id,
          senderRole: 'user',
          message: dto.message,
        },
      ],
    });

    property.listingUser.push(user._id);
    await property.save();

    return contact;
  }

  // Owner/User reply (SECURE VERSION)
  async sendMessage(senderId: string, dto: SendMessageDto) {
    const contact = await this.contactPropertyModel.findById(dto.contactId);
    if (!contact) throw new HttpException('Conversation not found', 404);

    // permission check (VERY IMPORTANT)
    const isParticipant =
      contact.userId.toString() === senderId ||
      contact.propertyOwnerId.toString() === senderId;

    if (!isParticipant) {
      throw new HttpException('You are not allowed in this conversation', 403);
    }

    // auto detect role
    const sender = await this.userModel.findById(senderId);
    if (!sender) throw new HttpException('Sender not found', 404);

    const role = sender.role === 'agent' ? 'agent' : 'user';

    await this.contactPropertyModel.findByIdAndUpdate(dto.contactId, {
      $push: {
        messages: {
          senderId: new Types.ObjectId(senderId),
          senderRole: role,
          message: dto.message,
        },
      },
      ...(role === 'agent' && { status: 'responded' }),
    });

    return { message: 'Message sent successfully' };
  }

  // Get full chat
  async getFullChat(contactId: string) {
    const chat = await this.contactPropertyModel.findById(contactId);
    if (!chat) throw new HttpException('Conversation not found', 404);
    return chat;
  }
  //agent get all leads
  async getMyAllmyLeads(
    userId: string,
    params: IFilterParams,
    options: IOptions,
  ) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { searchTerm, ...filterData } = params;

    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('User not found', 404);

    const andCondition: any[] = [];

    // Only agent's leads
    andCondition.push({ propertyOwnerId: user._id });

    // Filters (status, etc.)
    if (Object.keys(filterData).length > 0) {
      andCondition.push({
        $and: Object.entries(filterData).map(([key, value]) => ({
          [key]: value,
        })),
      });
    }

    // Search term for messages or status
    if (searchTerm) {
      andCondition.push({
        $or: [
          { status: { $regex: searchTerm, $options: 'i' } },
          { 'messages.message': { $regex: searchTerm, $options: 'i' } },
        ],
      });
    }

    const whereConditions =
      andCondition.length > 0 ? { $and: andCondition } : {};

    // Get contacts (leads) with pagination
    const contacts = await this.contactPropertyModel
      .find(whereConditions)
      .populate('userId', 'firstName lastName email profileImage role')
      .populate('propertyOwnerId', 'firstName lastName email profileImage role')
      .populate('propertyId', 'title location price status')
      .sort({ [sortBy || 'updatedAt']: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    const total =
      await this.contactPropertyModel.countDocuments(whereConditions);

    return {
      data: contacts,
      meta: {
        page,
        limit,
        total,
      },
    };
  }
  //agent view single lead details
  async getsingleLead(contactId: string) {
    const contact = await this.contactPropertyModel
      .findById(contactId)
      .populate({
        path: 'userId',
        select: 'firstName lastName email profileImage role',
      })
      .populate({
        path: 'propertyOwnerId',
        select: 'firstName lastName email profileImage role',
      })
      .populate({
        path: 'propertyId',
        select: 'title location price status images',
      })
      .populate({
        path: 'messages.senderId',
        select: 'firstName lastName email profileImage role',
      });

    if (!contact) {
      throw new HttpException('Contact not found', 404);
    }

    await this.contactPropertyModel.findByIdAndUpdate(
      contactId,
      {
        status: 'viewed',
      },
      { new: true },
    );

    return contact;
  }

  async inquiryHistory(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('User not found', 404);

    const [pending, viewed, responded, total] = await Promise.all([
      this.contactPropertyModel.countDocuments({
        userId: user._id,
        status: 'pending',
      }),

      this.contactPropertyModel.countDocuments({
        userId: user._id,
        status: 'viewed',
      }),

      this.contactPropertyModel.countDocuments({
        userId: user._id,
        status: 'responded',
      }),

      this.contactPropertyModel.countDocuments({
        userId: user._id,
      }),
    ]);

    return {
      totalInquiry: total,
      pendingInquiry: pending,
      viewedInquiry: viewed,
      respondedInquiry: responded,
    };
  }

  async getAllMyinquiry(
    userId: string,
    params: IFilterParams,
    options: IOptions,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('User not found', 404);

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

    andCondition.push({ userId: user._id });

    const whereConditions =
      andCondition.length > 0 ? { $and: andCondition } : {};

    const result = await this.contactPropertyModel
      .find(whereConditions)
      .sort({
        [sortBy || 'updatedAt']: sortOrder === 'asc' ? 1 : -1,
      })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email profileImage role')
      .populate('propertyId', 'title location price status images')
      .populate('propertyOwnerId', 'firstName lastName email profileImage role')
      .populate(
        'messages.senderId',
        'firstName lastName email profileImage role',
      );
    const total =
      await this.contactPropertyModel.countDocuments(whereConditions);

    return {
      data: result,
      meta: {
        page,
        limit,
        total,
      },
    };
  }
}
