import { Module } from '@nestjs/common';
import { ContactpropretyService } from './contactproprety.service';
import { ContactpropretyController } from './contactproprety.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ContactProperty,
  ContactPropertySchema,
} from './entities/contactproprety.entity';
import { Property, PropertySchema } from '../property/entities/property.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import {
  RecentActivity,
  RecentActivitySchema,
} from '../recent-activity/entities/recent-activity.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContactProperty.name, schema: ContactPropertySchema },
      { name: Property.name, schema: PropertySchema },
      { name: User.name, schema: UserSchema },
      { name: RecentActivity.name, schema: RecentActivitySchema },
    ]),
  ],
  controllers: [ContactpropretyController],
  providers: [ContactpropretyService],
})
export class ContactpropretyModule {}
