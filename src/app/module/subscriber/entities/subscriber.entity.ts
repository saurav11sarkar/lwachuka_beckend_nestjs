import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type SubscriberDocument = Subscriber & Document;

@Schema({ timestamps: true })
export class Subscriber {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  days: number;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  features: string[];

  @Prop({ enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  users: mongoose.Types.ObjectId[];
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);
