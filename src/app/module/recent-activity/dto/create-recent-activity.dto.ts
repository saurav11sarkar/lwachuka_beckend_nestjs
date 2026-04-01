import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRecentActivityDto {
  @IsMongoId()
  @IsOptional()
  property?: string;

  @IsEnum(['saved_property', 'inquiry_sent', 'site_visit_booked'])
  @IsNotEmpty()
  activityType: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
