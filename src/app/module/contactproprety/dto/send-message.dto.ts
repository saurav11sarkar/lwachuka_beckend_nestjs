import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @IsMongoId()
  contactId: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
