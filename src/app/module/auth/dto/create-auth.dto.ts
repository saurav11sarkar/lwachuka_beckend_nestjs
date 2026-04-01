import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAuthDto {
  @IsString()
  @IsNotEmpty({ message: 'First  name is requried' })
  fullName: string;

  @IsEmail()
  @IsNotEmpty({ message: 'Email is Requried' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is Requried' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Role is required' })
  role: string;

  @IsEnum(['active', 'block', 'pending'])
  @IsOptional()
  status?: string;
}
