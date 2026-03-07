import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types, HydratedDocument } from 'mongoose';

export type LoginhistoryDocument = HydratedDocument<Loginhistory>;

@Schema({ timestamps: true })
export class Loginhistory {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  role: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  loginTime: Date;

  @Prop({ required: true })
  ipaddress: string;

  @Prop({
    enum: ['success', 'failed', 'blocked'],
    default: 'success',
  })
  status: string;
}

export const LoginhistorySchema = SchemaFactory.createForClass(Loginhistory);
