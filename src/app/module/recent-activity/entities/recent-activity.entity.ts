import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type RecentActivityDocument = HydratedDocument<RecentActivity>;

@Schema({ timestamps: true })
export class RecentActivity {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Property' })
  property?: mongoose.Types.ObjectId;

  @Prop({
    enum: ['saved_property', 'inquiry_sent', 'site_visit_booked'],
    required: true,
  })
  activityType: string;

  @Prop({ required: true, trim: true })
  description: string;
}

export const RecentActivitySchema =
  SchemaFactory.createForClass(RecentActivity);
