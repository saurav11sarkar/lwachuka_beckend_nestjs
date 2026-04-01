import { Module } from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { AdvertisementController } from './advertisement.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Advertisement,
  AdvertisementSchema,
} from './entities/advertisement.entity';
import { User, UserSchema } from '../user/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Advertisement.name, schema: AdvertisementSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AdvertisementController],
  providers: [AdvertisementService],
})
export class AdvertisementModule {}
