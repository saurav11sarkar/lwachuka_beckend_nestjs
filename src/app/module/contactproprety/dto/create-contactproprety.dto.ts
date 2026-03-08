import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateContactpropretyDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEmail()
  email: string;

  @IsString()
  phoneNumber: string;
}
