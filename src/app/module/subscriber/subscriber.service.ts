import { HttpException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber } from './entities/subscriber.entity';
import mongoose from 'mongoose';
import { User } from '../user/entities/user.entity';
import { Payment } from '../payment/entities/payment.entity';
import { IFilterParams } from 'src/app/helper/pick';
import paginationHelper, { IOptions } from 'src/app/helper/pagenation';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import Stripe from 'stripe';
import config from 'src/app/config';
import { MpesaService } from '../mpesa/mpesa.service';

@Injectable()
export class SubscriberService {
  private readonly stripe = new Stripe(config.stripe.secretKey!);
  constructor(
    @InjectModel(Subscriber.name)
    private readonly subscriberModel: mongoose.Model<Subscriber>,
    @InjectModel(User.name)
    private readonly userModel: mongoose.Model<User>,
    @InjectModel(Payment.name)
    private readonly paymentModel: mongoose.Model<Payment>,
    private readonly mpesaService: MpesaService,
  ) {}

  async create(createSubscriberDto: CreateSubscriberDto) {
    const result = await this.subscriberModel.create(createSubscriberDto);
    if (!result) throw new HttpException('Failed to create subscriber', 500);
    return result;
  }

  async getAllSubscribers(params: IFilterParams, options: IOptions) {
    const { limit, page, skip, sortBy, sortOrder } = paginationHelper(options);
    const { searchTerm, ...filterData } = params;

    const andCondition: any[] = [];
    const searchAbleFields = ['name', 'description', 'status'];

    if (searchTerm) {
      andCondition.push({
        $or: searchAbleFields.map((field) => ({
          [field]: {
            $regex: searchTerm,
            $options: 'i',
          },
        })),
      });
    }

    if (Object.keys(filterData).length > 0) {
      andCondition.push({
        $and: Object.entries(filterData).map(([key, value]) => ({
          [key]: value,
        })),
      });
    }

    const whereConditions =
      andCondition.length > 0 ? { $and: andCondition } : {};

    const result = await this.subscriberModel
      .find(whereConditions)
      .sort({ [sortBy]: sortOrder } as any)
      .skip(skip)
      .limit(limit);
    const total = await this.subscriberModel.countDocuments(whereConditions);

    return {
      data: result,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async getSingleSubscriber(id: string) {
    const result = await this.subscriberModel.findById(id);
    if (!result) throw new HttpException('Subscriber not found', 404);
    return result;
  }

  async updateSubscriber(id: string, payload: UpdateSubscriberDto) {
    const isExist = await this.subscriberModel.findById(id);
    if (!isExist) throw new HttpException('Subscriber not found', 404);
    const result = await this.subscriberModel.findByIdAndUpdate(id, payload, {
      new: true,
    });
    return result;
  }

  async deleteSubscriber(id: string) {
    const isExist = await this.subscriberModel.findById(id);
    if (!isExist) throw new HttpException('Subscriber not found', 404);
    const result = await this.subscriberModel.findByIdAndDelete(id);
    return result;
  }

  async padListing(userId: string, subscriberId: string) {
    const isExist = await this.userModel.findById(userId);
    if (!isExist) throw new HttpException('User not found', 404);
    const isSubscriberExist = await this.subscriberModel.findById(subscriberId);
    if (!isSubscriberExist)
      throw new HttpException('Subscriber not found', 404);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: isSubscriberExist.name,
              description: isSubscriberExist.features.join(', ') || '',
            },
            unit_amount: isSubscriberExist.price * 100,
          },
          quantity: 1,
        },
      ],
      customer_email: isExist.email,
      success_url: `${config.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/payment/cancel`,
      metadata: {
        userId: isExist._id.toString(),
        subscriberId: isSubscriberExist._id.toString(),
        paymentType: 'subscription',
        price: isSubscriberExist.price,
        days: isSubscriberExist.days,
      },
    } as Stripe.Checkout.SessionCreateParams);

    await this.paymentModel.create({
      user: isExist._id,
      subscriber: isSubscriberExist._id,
      amount: isSubscriberExist.price,
      currency: 'usd',
      status: 'pending',
      stripeSessionId: session.id,
      paymentType: 'subscription',
    });

    return session.url;
  }

  async padListingMpesa(
    userId: string,
    subscriberId: string,
    phoneNumber: string,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('User not found', 404);

    const sub = await this.subscriberModel.findById(subscriberId);
    if (!sub) throw new HttpException('Subscriber not found', 404);

    // Step 1: Create pending payment
    const payment = await this.paymentModel.create({
      user: user._id,
      subscriber: sub._id,
      amount: sub.price,
      currency: 'KES',
      status: 'pending',
      paymentType: 'subscription',
      mpesaPhoneNumber: phoneNumber,
    });

    // Step 2: Send STK Push
    const stkRes = await this.mpesaService.stkPush({
      phone: phoneNumber,
      amount: sub.price,
      accountReference: `SUB-${sub._id}`,
      transactionDesc: `Subscription: ${sub.name}`,
    });

    // Step 3: Save CheckoutRequestID to match with callback
    await this.paymentModel.findByIdAndUpdate(payment._id, {
      mpesaMerchantRequestId: stkRes.MerchantRequestID,
      mpesaCheckoutRequestId: stkRes.CheckoutRequestID,
    });

    return {
      paymentId: payment._id,
      merchantRequestId: stkRes.MerchantRequestID,
      checkoutRequestId: stkRes.CheckoutRequestID,
      amount: sub.price,
      // ✅ After this, user enters PIN on phone → Safaricom calls callback automatically
      message:
        stkRes.CustomerMessage ||
        'STK Push sent. Please enter PIN on your phone.',
    };
  }
}
