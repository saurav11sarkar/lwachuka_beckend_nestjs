import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum AdvertisementStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class CreateAdvertisementmanagementDto {
  @IsString()
  @IsNotEmpty({ message: 'Plan name is required' })
  planName: string;

  @IsInt()
  @IsNotEmpty({ message: 'Plan price is required' })
  price: number;

  @IsInt()
  @IsNotEmpty()
  duration: number;

  @IsInt()
  @IsOptional()
  listingLimit?: number;

  @IsString()
  @IsNotEmpty()
  promotionType: string;

  @IsEnum(AdvertisementStatus)
  @IsOptional()
  status?: AdvertisementStatus;
}
