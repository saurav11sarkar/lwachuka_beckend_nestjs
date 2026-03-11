import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsStrongPassword(
    {},
    {
      message:
        'Password must contain uppercase, lowercase, number and special character',
    },
  )
  password: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsEnum(['user', 'agent', 'vendor', 'admin'])
  role?: string;

  @IsOptional()
  @IsEnum(['male', 'female'])
  gender?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  postCode?: string;

  @IsOptional()
  @IsString()
  stripeAccountId?: string;

  @IsBoolean()
  @IsOptional()
  isSubscribed?: boolean;

  @IsMongoId()
  @IsOptional()
  subscribers?: string;

  @IsDate()
  @IsOptional()
  subscriptionEndDate?: Date;

  @IsEnum(['active', 'block', 'pending'])
  @IsOptional()
  status?: string;

  @IsOptional()
  @IsString()
  expertise?: string[];

  @IsOptional()
  @IsString()
  serviceAreas?: string[];

  @IsOptional()
  experience?: number;
}
