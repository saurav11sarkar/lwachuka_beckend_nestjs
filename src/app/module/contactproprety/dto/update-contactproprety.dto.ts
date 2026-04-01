import { PartialType } from '@nestjs/mapped-types';
import { CreateContactpropretyDto } from './create-contactproprety.dto';

export class UpdateContactpropretyDto extends PartialType(CreateContactpropretyDto) {}
