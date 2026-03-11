import { Prop, Schema } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type RecentActivityDocument = HydratedDocument<RecentActivity>;

@Schema({ timestamps: true })
export class RecentActivity {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: mongoose.Types.ObjectId;
}
