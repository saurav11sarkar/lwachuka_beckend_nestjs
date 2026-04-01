import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePaymentDto {
  @IsOptional()
  @IsMongoId()
  user?: string;

  @IsOptional()
  @IsMongoId()
  subscriber?: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  stripeSessionId?: string;

  @IsOptional()
  @IsString()
  stripePaymentIntentId?: string;

  @IsOptional()
  @IsString()
  paymentType?: string;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsOptional()
  @IsEnum(['pending', 'pending_retry', 'completed', 'failed', 'refunded'])
  status?: 'pending' | 'pending_retry' | 'completed' | 'failed' | 'refunded';
}
