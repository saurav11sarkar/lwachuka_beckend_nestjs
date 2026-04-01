import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({ example: 'John' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: 'john@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password@123' })
  @IsStrongPassword()
  password: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  profileImage?: string;

  @ApiPropertyOptional({
    enum: ['user', 'agent', 'vendor', 'admin'],
    example: 'user',
  })
  @IsOptional()
  @IsEnum(['user', 'agent', 'vendor', 'admin'])
  role?: string;

  @ApiPropertyOptional({ enum: ['male', 'female'] })
  @IsOptional()
  @IsEnum(['male', 'female'])
  gender?: string;

  @ApiPropertyOptional({ example: '+8801711000000' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Real estate agent with 5 years experience' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: '123 Main Street' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Dhaka' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: '1212' })
  @IsOptional()
  @IsString()
  postCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stripeAccountId?: string;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isSubscribed?: boolean;

  @ApiPropertyOptional()
  @IsMongoId()
  @IsOptional()
  subscribers?: string;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  subscriptionEndDate?: Date;

  @ApiPropertyOptional({ enum: ['active', 'block', 'pending'] })
  @IsEnum(['active', 'block', 'pending'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: ['renovation', 'interior design'] })
  @IsOptional()
  @IsString()
  expertise?: string[];

  @ApiPropertyOptional({ example: ['Dhaka', 'Chittagong'] })
  @IsOptional()
  @IsString()
  serviceAreas?: string[];

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  experience?: number;
}
