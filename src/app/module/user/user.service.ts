import { HttpException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import mongoose from 'mongoose';
import { fileUpload } from 'src/app/helper/fileUploder';
import { getLatLngFromAddress } from 'src/app/helper/geocode';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import {
  Property,
  PropertyDocument,
} from '../property/entities/property.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: mongoose.Model<User>,
    @InjectModel(Property.name)
    private readonly propertyModel: mongoose.Model<PropertyDocument>,
  ) {}

  async createUser(
    createUserDto: Partial<CreateUserDto>,
    file?: Express.Multer.File,
  ) {
    const user = await this.userModel.findOne({ email: createUserDto.email });
    if (user) throw new HttpException('User already exists', 409);

    if (file) {
      const profileImage = await fileUpload.uploadToCloudinary(file);
      createUserDto.profileImage = profileImage.url;
    }

    const fullAddress = `${createUserDto.location || ''} ${createUserDto.address || ''}`;

    let lat: number | null = null;
    let lng: number | null = null;

    if (fullAddress.trim()) {
      const coords = await getLatLngFromAddress(fullAddress);
      lat = coords.lat;
      lng = coords.lng;
    }

    const result = await this.userModel.create({
      ...createUserDto,
      lat: lat ?? undefined,
      lng: lng ?? undefined,
    });

    return result;
  }

  // async getAllUsers(params: IFilterParams, options: IOptions) {
  //   const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
  //   const { searchTerm, ...filterData } = params;

  //   const andCondition: any[] = [];
  //   const searchAbleFields = [
  //     'firstName',
  //     'lastName',
  //     'email',
  //     'role',
  //     'location',
  //     'phoneNumber',
  //     'address',
  //     'status',
  //   ];

  //   if (searchTerm) {
  //     andCondition.push({
  //       $or: searchAbleFields.map((field) => ({
  //         [field]: {
  //           $regex: searchTerm,
  //           $options: 'i',
  //         },
  //       })),
  //     });
  //   }

  //   if (Object.keys(filterData).length > 0) {
  //     andCondition.push({
  //       $and: Object.entries(filterData).map(([key, value]) => ({
  //         [key]: value,
  //       })),
  //     });
  //   }

  //   const whereConditions =
  //     andCondition.length > 0 ? { $and: andCondition } : {};

  //   const result = await this.userModel
  //     .find(whereConditions)
  //     .sort({ [sortBy]: sortOrder } as any)
  //     .skip(skip)
  //     .limit(limit);
  //   const total = await this.userModel.countDocuments(whereConditions);

  //   return {
  //     data: result,
  //     meta: {
  //       page,
  //       limit,
  //       total,
  //     },
  //   };
  // }

  async getAllUsers(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { searchTerm, ...filterData } = params;

    const andCondition: any[] = [];

    const searchAbleFields = [
      'firstName',
      'lastName',
      'email',
      'role',
      'location',
      'phoneNumber',
      'address',
      'status',
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

    const matchStage = andCondition.length > 0 ? { $and: andCondition } : {};

    const result = await this.userModel.aggregate([
      {
        $match: matchStage,
      },

      // Property count for agent
      {
        $lookup: {
          from: 'properties',
          localField: '_id',
          foreignField: 'createBy',
          as: 'properties',
        },
      },

      // Advertisement count for vendor
      {
        $lookup: {
          from: 'advertisements',
          localField: '_id',
          foreignField: 'createdBy',
          as: 'advertisements',
        },
      },

      {
        $addFields: {
          approvedPropertyCount: {
            $size: {
              $filter: {
                input: '$properties',
                as: 'property',
                cond: { $eq: ['$$property.status', 'approved'] },
              },
            },
          },

          advertisementCount: {
            $size: '$advertisements',
          },
        },
      },

      {
        $project: {
          properties: 0,
          advertisements: 0,
        },
      },

      {
        $sort: {
          [sortBy]: sortOrder === 'asc' ? 1 : -1,
        },
      },

      {
        $skip: skip,
      },

      {
        $limit: limit,
      },
    ]);

    const total = await this.userModel.countDocuments(matchStage);

    return {
      data: result,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async getSingleUser(id: string) {
    const result = await this.userModel.findById(id);
    if (!result) throw new HttpException('User not found', 404);
    return result;
  }

  async updateUserInfo(
    id: string,
    payload: Partial<CreateUserDto>,
    file?: Express.Multer.File,
  ) {
    const isExist = await this.userModel.findById(id);
    if (!isExist) throw new HttpException('User not found', 404);

    if (file) {
      const profileImage = await fileUpload.uploadToCloudinary(file);
      payload.profileImage = profileImage.url;
    }
    const fullAddress = `${payload.location || ''} ${payload.address || ''}`;
    let lat: number | null = null;
    let lng: number | null = null;

    if (fullAddress.trim()) {
      const coords = await getLatLngFromAddress(fullAddress);
      lat = coords.lat;
      lng = coords.lng;
    }

    const result = await this.userModel.findByIdAndUpdate(
      id,
      { ...payload, lat: lat ?? undefined, lng: lng ?? undefined },
      {
        new: true,
      },
    );
    return result;
  }

  async deleteUser(id: string) {
    const isExist = await this.userModel.findById(id);
    if (!isExist) throw new HttpException('User not found', 404);
    const result = await this.userModel.findByIdAndDelete(id);
    return result;
  }

  async getProfile(id: string) {
    const result = await this.userModel.findById(id).populate('subscribers');
    if (!result) throw new HttpException('User not found', 404);
    return result;
  }

  async updateProfile(
    id: string,
    payload: Partial<CreateUserDto>,
    file?: Express.Multer.File,
  ) {
    const isExist = await this.userModel.findById(id);
    if (!isExist) throw new HttpException('User not found', 404);

    if (file) {
      const profileImage = await fileUpload.uploadToCloudinary(file);
      payload.profileImage = profileImage.url;
    }
    const fullAddress = `${payload.location || ''} ${payload.address || ''}`;
    let lat: number | null = null;
    let lng: number | null = null;

    if (fullAddress.trim()) {
      const coords = await getLatLngFromAddress(fullAddress);
      lat = coords.lat;
      lng = coords.lng;
    }

    const result = await this.userModel.findByIdAndUpdate(
      id,
      { ...payload, lat: lat ?? undefined, lng: lng ?? undefined },
      {
        new: true,
      },
    );
    return result;
  }
}
