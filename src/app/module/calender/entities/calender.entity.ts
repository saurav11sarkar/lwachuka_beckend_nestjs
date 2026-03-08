import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type CalenderDocument = Calender & Document;

@Schema({ timestamps: true })
export class Calender {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  moveInData: Date;

  @Prop({ required: true })
  phone: string;

  @Prop()
  customMessage: string;

  @Prop({
    enum: ['pending', 'approved', 'completed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Property' })
  property: mongoose.Types.ObjectId;
}

export const CalenderSchema = SchemaFactory.createForClass(Calender);
