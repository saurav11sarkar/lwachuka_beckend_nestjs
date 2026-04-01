import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type FaqDocument = HydratedDocument<Faq>;

@Schema({ timestamps: true })
export class Faq {
  @Prop()
  question: string;

  @Prop()
  answer: string;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
