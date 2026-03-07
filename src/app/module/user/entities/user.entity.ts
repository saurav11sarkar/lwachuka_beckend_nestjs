import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcrypt';
import config from 'src/app/config';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  profileImage: string;

  @Prop({ enum: ['user', 'agent', 'vendor', 'admin'], default: 'user' })
  role: string;

  @Prop({ enum: ['male', 'female'] })
  gender: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  bio: string;

  @Prop()
  address: string;

  @Prop()
  location: string;

  @Prop()
  lat: number;

  @Prop()
  lng: number;

  @Prop()
  postCode: string;

  @Prop({ enum: ['active', 'block', 'pending'], default: 'pending' })
  status: string;

  @Prop()
  otp?: string;

  @Prop()
  otpExpiry?: Date;

  // default false
  @Prop({ default: false })
  verifiedForget: boolean;

  // optional
  @Prop()
  stripeAccountId: string;

  // default false
  @Prop({ default: false })
  isSubscribed: boolean;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Subscriber' })
  subscribers: mongoose.Types.ObjectId;

  @Prop()
  subscriptionEndDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcryptSaltRounds),
  );
});
