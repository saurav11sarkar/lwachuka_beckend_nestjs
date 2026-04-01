import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type AdvertisementDocument = HydratedDocument<Advertisement>;

@Schema({ timestamps: true })
export class Advertisement {
  @Prop()
  companyName: string;

  @Prop()
  advertisementType: string;

  @Prop()
  callToActionURL: string;

  @Prop()
  uploadMedia: string;

  @Prop()
  targetRegions: string[];

  @Prop()
  targetAudience: string[];

  @Prop()
  compaingBudget: number;

  @Prop()
  compaingDuration: string;

  @Prop()
  startDate: Date;

  @Prop()
  endDate: Date;

  @Prop()
  paymentStatus: string;

  @Prop()
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;
}

export const AdvertisementSchema = SchemaFactory.createForClass(Advertisement);
