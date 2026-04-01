import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type PropertyDocument = Property & Document;

@Schema({ timestamps: true })
export class Property {
  @Prop({ required: true })
  title: string;

  @Prop({ enum: ['For Sale', 'For Rent'], required: true })
  listingType: string;

  @Prop({
    enum: [
      'Apartment',
      'Studio',
      'Penthouse',
      'Duplex',
      'Condo',
      'Bungalow',
      'Cottage',
    ],
    required: true,
  })
  propertyType: string;

  @Prop()
  bedrooms: number;

  @Prop()
  bathrooms: number;

  @Prop()
  area: number;

  @Prop()
  landArea: number;

  @Prop()
  builtUp: number;

  @Prop()
  plot: number;

  @Prop()
  keyBathrooms: string;

  @Prop()
  keyBedRooms: string;

  @Prop()
  keyBuiltUp: number;

  @Prop()
  keyKitchenType: string;

  @Prop()
  keyParking: string;

  @Prop()
  keyFinishes: string;

  @Prop()
  keyBalconyType: string;

  @Prop()
  keyStorage: string;

  @Prop()
  keyCoolingSystem: string;

  @Prop()
  keyMoveInStatus: string;

  @Prop()
  description: string;

  @Prop()
  propertyCommunityAmenities: string[];

  @Prop({ required: true })
  location: string;

  @Prop()
  lat: number;

  @Prop()
  lng: number;

  @Prop({ required: true })
  price: number;

  @Prop()
  images: string[];

  @Prop()
  purpose: string;

  @Prop()
  referenceNumber: string;

  @Prop()
  furnishing: string;

  @Prop()
  addedOn: string;

  @Prop()
  originalPrice: number;

  @Prop()
  handoverDate: Date;

  @Prop({ enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createBy: mongoose.Types.ObjectId;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  listingUser: mongoose.Types.ObjectId[];

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User' })
  bookmarkUser: mongoose.Types.ObjectId[];
}

export const PropertySchema = SchemaFactory.createForClass(Property);
