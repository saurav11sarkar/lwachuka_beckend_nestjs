import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateFaqDto {
  @ApiPropertyOptional({ example: '' })
  @IsString()
  @IsOptional()
  question: string;

  @ApiPropertyOptional({ example: '' })
  @IsString()
  @IsOptional()
  answer: string;
}
