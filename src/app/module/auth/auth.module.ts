import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/entities/user.entity';
import {
  Loginhistory,
  LoginhistorySchema,
} from '../loginhistory/entities/loginhistory.entity';

@Global()
@Module({
  imports: [
    JwtModule.register({ global: true }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Loginhistory.name, schema: LoginhistorySchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
