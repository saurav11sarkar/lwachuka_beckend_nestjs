import { HttpException, Injectable } from '@nestjs/common';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Advertisement,
  AdvertisementDocument,
} from './entities/advertisement.entity';
import mongoose from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';
import { fileUpload } from 'src/app/helper/fileUploder';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';

@Injectable()
export class AdvertisementService {
  constructor(
    @InjectModel(Advertisement.name)
    private readonly advertisementModel: mongoose.Model<AdvertisementDocument>,
    @InjectModel(User.name)
    private readonly userModel: mongoose.Model<UserDocument>,
  ) {}

  async createAdvertisement(
    userId: string,
    dto: CreateAdvertisementDto,
    file?: Express.Multer.File,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('User not found', 404);

    let uploadedUrl = '';

    if (file) {
      const advertisementMedia = await fileUpload.uploadToCloudinary(file);
      if (!advertisementMedia)
        throw new HttpException('Failed to upload advertisement media', 400);

      uploadedUrl = advertisementMedia.url;
    }

    const result = await this.advertisementModel.create({
      ...dto,
      uploadMedia: uploadedUrl,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      compaingBudget: dto.compaingBudget
        ? Number(dto.compaingBudget)
        : undefined,
      createdBy: userId,
    });

    return result;
  }

  async getAllAdvertisement(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { searchTerm, ...filterData } = params;

    const andCondition: any[] = [];
    const searchAbleFields = [
      'companyName',
      'advertisementType',
      'targetRegions',
      'targetAudience',
      'compaingDuration',
    ];

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

    const whereCondition =
      andCondition.length > 0 ? { $and: andCondition } : {};
    const result = await this.advertisementModel
      .find(whereCondition)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total = await this.advertisementModel.countDocuments(whereCondition);
    return { result, meta: { total, limit, page } };
  }

  async getMyAdvertisement(
    userId: string,
    params: IFilterParams,
    options: IOptions,
  ) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { searchTerm, ...filterData } = params;

    const andCondition: any[] = [];
    const searchAbleFields = [
      'companyName',
      'advertisementType',
      'targetRegions',
      'targetAudience',
      'compaingDuration',
    ];

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
      createdBy: userId,
    });

    const whereCondition =
      andCondition.length > 0 ? { $and: andCondition } : {};
    const result = await this.advertisementModel
      .find(whereCondition)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total = await this.advertisementModel.countDocuments(whereCondition);
    return { result, meta: { total, limit, page } };
  }

  async getAdvertisementById(id: string) {
    const result = await this.advertisementModel.findById(id);
    if (!result) throw new HttpException('Advertisement not found', 404);
    return result;
  }

  async updateMyAdvertisement(
    userId: string,
    id: string,
    dto: UpdateAdvertisementDto,
    file?: Express.Multer.File,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('User not found', 404);

    const advertisement = await this.advertisementModel.findById(id);
    if (!advertisement) throw new HttpException('Advertisement not found', 404);

    if (advertisement.createdBy.toString() !== user._id.toString())
      throw new HttpException(
        'You are not authorized to update this advertisement',
        403,
      );

    let uploadedUrl = '';

    if (file) {
      const advertisementMedia = await fileUpload.uploadToCloudinary(file);
      if (!advertisementMedia)
        throw new HttpException('Failed to upload advertisement media', 400);

      uploadedUrl = advertisementMedia.url;
    }

    const result = await this.advertisementModel.findByIdAndUpdate(
      id,
      {
        ...dto,
        uploadMedia: uploadedUrl,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        compaingBudget: dto.compaingBudget
          ? Number(dto.compaingBudget)
          : undefined,
      },
      { new: true },
    );

    return result;
  }

  async deleteMyAdvertisement(userId: string, id: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('User not found', 404);

    const advertisement = await this.advertisementModel.findById(id);
    if (!advertisement) throw new HttpException('Advertisement not found', 404);

    if (advertisement.createdBy.toString() !== user._id.toString())
      throw new HttpException(
        'You are not authorized to delete this advertisement',
        403,
      );

    const result = await this.advertisementModel.findByIdAndDelete(id);
    return result;
  }
}
