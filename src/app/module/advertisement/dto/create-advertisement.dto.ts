import {
  IsString,
  IsOptional,
  IsArray,
  IsNumberString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAdvertisementDto {
  @IsString()
  companyName: string;

  @IsString()
  advertisementType: string;

  @IsOptional()
  @IsString()
  callToActionURL?: string;


  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    value ? JSON.parse(value) : []
  )
  targetRegions?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    value ? JSON.parse(value) : []
  )
  targetAudience?: string[];

  @IsOptional()
  @IsString()
  compaingBudget?: string;

  @IsOptional()
  @IsString()
  compaingDuration?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  status?: string;
}