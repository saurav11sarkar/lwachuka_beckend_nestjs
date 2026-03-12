import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecentActivityService } from './recent-activity.service';
import { RecentActivityController } from './recent-activity.controller';
import {
  RecentActivity,
  RecentActivitySchema,
} from './entities/recent-activity.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { Property, PropertySchema } from '../property/entities/property.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RecentActivity.name, schema: RecentActivitySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [RecentActivityController],
  providers: [RecentActivityService],
})
export class RecentActivityModule {}
