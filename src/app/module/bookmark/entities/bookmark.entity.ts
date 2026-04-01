import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type BookmarkDocument = Bookmark & mongoose.Document;

@Schema({ timestamps: true })
export class Bookmark {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Property' })
  property: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: mongoose.Types.ObjectId;
}

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);
