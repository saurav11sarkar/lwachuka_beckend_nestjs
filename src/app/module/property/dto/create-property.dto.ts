import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreatePropertyDto {
  @IsString()
  title: string;

  @IsEnum(['For Sale', 'For Rent'])
  listingType: string;

  @IsEnum([
    'Apartment',
    'Studio',
    'Penthouse',
    'Duplex',
    'Condo',
    'Bungalow',
    'Cottage',
  ])
  propertyType: string;

  @Type(() => Number)
  @IsNumber()
  bedrooms: number;

  @Type(() => Number)
  @IsNumber()
  bathrooms: number;

  @Type(() => Number)
  @IsNumber()
  area: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  builtUp?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  plot?: number;

  // ✅ Fixed naming according to model (key*)
  @IsOptional()
  @IsString()
  keyBathrooms?: string;

  @IsOptional()
  @IsString()
  keyBedRooms?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  keyBuiltUp?: number;

  @IsOptional()
  @IsString()
  keyKitchenType?: string;

  @IsOptional()
  @IsString()
  keyParking?: string;

  @IsOptional()
  @IsString()
  keyFinishes?: string;

  @IsOptional()
  @IsString()
  keyBalconyType?: string;

  @IsOptional()
  @IsString()
  keyStorage?: string;

  @IsOptional()
  @IsString()
  keyCoolingSystem?: string;

  @IsOptional()
  @IsString()
  keyMoveInStatus?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return JSON.parse(value);
    return [];
  })
  @IsArray()
  propertyCommunityAmenities?: string[];

  @IsString()
  location: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lat?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  lng?: number;

  @Type(() => Number)
  @IsNumber()
  price: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return [value];
    return [];
  })
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  furnishing?: string;

  @IsOptional()
  @IsString()
  addedOn?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  originalPrice?: number;

  @IsOptional()
  @Transform(({ value }) => value ? new Date(value).toISOString() : undefined)
  @IsDateString()
  handoverDate?: Date;

  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected'])
  status?: string;

  @IsOptional()
  @IsArray()
  listingUser?: string[];

  @IsOptional()
  @IsArray()
  bookmarkUser?: string[];
}
