import { Module } from '@nestjs/common';
import { AdvertisementmanagementService } from './advertisementmanagement.service';
import { AdvertisementmanagementController } from './advertisementmanagement.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Advertisementmanagement,
  AdvertisementmanagementSchema,
} from './entities/advertisementmanagement.entity';
import { User, UserSchema } from '../user/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Advertisementmanagement.name,
        schema: AdvertisementmanagementSchema,
      },
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [AdvertisementmanagementController],
  providers: [AdvertisementmanagementService],
})
export class AdvertisementmanagementModule {}
