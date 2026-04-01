import { Module } from '@nestjs/common';
import { BookmarkService } from './bookmark.service';
import { BookmarkController } from './bookmark.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Bookmark, BookmarkSchema } from './entities/bookmark.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { Property, PropertySchema } from '../property/entities/property.entity';
import {
  RecentActivity,
  RecentActivitySchema,
} from '../recent-activity/entities/recent-activity.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: User.name, schema: UserSchema },
      { name: Property.name, schema: PropertySchema },
      { name: RecentActivity.name, schema: RecentActivitySchema },
    ]),
  ],
  controllers: [BookmarkController],
  providers: [BookmarkService],
})
export class BookmarkModule {}
