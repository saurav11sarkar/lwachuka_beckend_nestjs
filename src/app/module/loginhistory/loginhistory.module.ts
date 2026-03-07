import { Module } from '@nestjs/common';
import { LoginhistoryService } from './loginhistory.service';
import { LoginhistoryController } from './loginhistory.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Loginhistory,
  LoginhistorySchema,
} from './entities/loginhistory.entity';
import { User, UserSchema } from '../user/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Loginhistory.name, schema: LoginhistorySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [LoginhistoryController],
  providers: [LoginhistoryService],
})
export class LoginhistoryModule {}
