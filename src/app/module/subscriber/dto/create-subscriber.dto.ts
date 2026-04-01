import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSubscriberDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Days is required' })
  days: number;

  @IsNumber()
  @IsNotEmpty({ message: 'Price is required' })
  price: number;

  @IsArray()
  @IsOptional()
  features?: string[];

  @IsString()
  @IsOptional()
  @IsEnum(['active', 'inactive'], {
    message: 'Status must be active or inactive',
  })
  status?: string;

  @IsMongoId()
  @IsOptional()
  user?: string;
}
