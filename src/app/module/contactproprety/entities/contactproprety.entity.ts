import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContactPropertyDocument = ContactProperty & Document;

class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ enum: ['user', 'vendor'], required: true })
  senderRole: 'user' | 'vendor';

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class ContactProperty {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  email: string;

  @Prop()
  phoneNumber: string;

  @Prop({ type: Types.ObjectId, ref: 'Property', required: true })
  propertyId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  propertyOwnerId: Types.ObjectId;

  @Prop({ enum: ['pending', 'viewed', 'responded'], default: 'pending' })
  status: string;

  @Prop({ default: false })
  isClosed: boolean;

  @Prop({ type: [Message], default: [] })
  messages: Message[];
}

export const ContactPropertySchema =
  SchemaFactory.createForClass(ContactProperty);
