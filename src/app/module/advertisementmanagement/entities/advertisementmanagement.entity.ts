import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type AdvertisementmanagementDocument = Advertisementmanagement &
  Document;

Schema({ timestamps: true });
export class Advertisementmanagement {
  @Prop({ required: true })
  planName: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  duration: number;

  @Prop()
  listingLimit: number;

  @Prop({ required: true })
  promotionType: string;

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  advertisementUsers: mongoose.Schema.Types.ObjectId[];
}

export const AdvertisementmanagementSchema = SchemaFactory.createForClass(
  Advertisementmanagement,
);
