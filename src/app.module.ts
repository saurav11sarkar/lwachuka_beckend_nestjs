import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './app/module/user/user.module';
import { AuthModule } from './app/module/auth/auth.module';
import { PropertyModule } from './app/module/property/property.module';
import { SubscriberModule } from './app/module/subscriber/subscriber.module';
import { PaymentModule } from './app/module/payment/payment.module';
import { WebhookModule } from './app/module/webhook/webhook.module';
import { CalenderModule } from './app/module/calender/calender.module';
import { BookmarkModule } from './app/module/bookmark/bookmark.module';
import { ContactModule } from './app/module/contact/contact.module';
import { ContactpropretyModule } from './app/module/contactproprety/contactproprety.module';
import { AdvertisementmanagementModule } from './app/module/advertisementmanagement/advertisementmanagement.module';
import { AdvertisementModule } from './app/module/advertisement/advertisement.module';
import { MpesaModule } from './app/module/mpesa/mpesa.module';
import { DashboardModule } from './app/module/dashboard/dashboard.module';
import { LoginhistoryModule } from './app/module/loginhistory/loginhistory.module';
import config from './app/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(config.mongoUri!),
    UserModule,
    AuthModule,
    PropertyModule,
    SubscriberModule,
    PaymentModule,
    WebhookModule,
    CalenderModule,
    BookmarkModule,
    ContactModule,
    ContactpropretyModule,
    AdvertisementmanagementModule,
    AdvertisementModule,
    MpesaModule,
    DashboardModule,
    LoginhistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
