import {
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCalenderDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsDate()
  @IsNotEmpty({ message: 'Move in date is required' })
  moveInData: Date;

  @IsString()
  @IsNotEmpty({ message: 'Phone is required' })
  phone: string;

  @IsString()
  @IsOptional()
  customMessage?: string;

  @IsMongoId()
  @IsOptional()
  user?: string;

  @IsMongoId()
  @IsOptional()
  property?: string;
}
