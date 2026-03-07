import { IsDate, IsMongoId, IsString } from 'class-validator';

export class CreateLoginhistoryDto {
  @IsMongoId()
  userId: string;

  @IsString()
  role: string;

  @IsString()
  email: string;

  @IsDate()
  loginTime: Date;

  @IsString()
  ipaddress: string;
}
