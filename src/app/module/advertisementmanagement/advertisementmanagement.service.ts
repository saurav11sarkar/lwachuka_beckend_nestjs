import { HttpException, Injectable } from '@nestjs/common';
import { CreateAdvertisementmanagementDto } from './dto/create-advertisementmanagement.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Advertisementmanagement,
  AdvertisementmanagementDocument,
} from './entities/advertisementmanagement.entity';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/entities/user.entity';

@Injectable()
export class AdvertisementmanagementService {
  constructor(
    @InjectModel(Advertisementmanagement.name)
    private readonly advertisementmanagementModel: Model<AdvertisementmanagementDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async createAdvertisementmanagement(
    createAdvertisementmanagementDto: CreateAdvertisementmanagementDto,
  ) {
    const advertisementmanagement =
      await this.advertisementmanagementModel.findOne({
        promotionType: createAdvertisementmanagementDto.promotionType,
      });

    if (advertisementmanagement)
      throw new HttpException(
        'Advertisement Management Type Already Exists',
        400,
      );

    const result = await this.advertisementmanagementModel.create(
      createAdvertisementmanagementDto,
    );

    return result;
  }
}
