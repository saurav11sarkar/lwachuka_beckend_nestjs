import { Module } from '@nestjs/common';
import { CalenderService } from './calender.service';
import { CalenderController } from './calender.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CalenderSchema } from './entities/calender.entity';
import { PropertySchema } from '../property/entities/property.entity';
import { UserSchema } from '../user/entities/user.entity';
import {
  RecentActivity,
  RecentActivitySchema,
} from '../recent-activity/entities/recent-activity.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Calender', schema: CalenderSchema },
      { name: 'Property', schema: PropertySchema },
      { name: 'User', schema: UserSchema },
      { name: RecentActivity.name, schema: RecentActivitySchema },
    ]),
  ],
  controllers: [CalenderController],
  providers: [CalenderService],
})
export class CalenderModule {}
