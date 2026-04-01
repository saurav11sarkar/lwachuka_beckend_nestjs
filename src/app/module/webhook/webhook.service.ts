import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Response } from 'express';
import config from '../../config';
import { Payment, PaymentDocument } from '../payment/entities/payment.entity';
import { User, UserDocument } from '../user/entities/user.entity';
import {
  Subscriber,
  SubscriberDocument,
} from '../subscriber/entities/subscriber.entity';

@Injectable()
export class WebhookService {
  private readonly stripe = new Stripe(config.stripe.secretKey!);
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Subscriber.name)
    private readonly subscriberModel: Model<SubscriberDocument>,
  ) {}

  async handleWebhook(rawBody: Buffer, sig: string, res: Response) {
    let event: Stripe.Event;

    // Stripe Signature Verify
    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        sig,
        config.stripe.webhookSecret!,
      );
    } catch (err: any) {
      this.logger.error(`Webhook signature error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event, res);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event, res);
          break;

        default:
          this.logger.log(`Unhandled event type: ${event.type}`);
          return res.json({ received: true });
      }
    } catch (err: any) {
      this.logger.error(`Handler error: ${err.message}`);
      return res.status(500).send(`Webhook Handler Error: ${err.message}`);
    }
  }

  // ===============================
  // CHECKOUT COMPLETED
  // ===============================
  private async handleCheckoutCompleted(event: Stripe.Event, res: Response) {
    const session = event.data.object as Stripe.Checkout.Session;

    const payment = await this.paymentModel.findOne({
      stripeSessionId: session.id,
    });
    if (!payment) return res.json({ received: true });

    payment.status = 'completed';
    payment.stripePaymentIntentId = session.payment_intent as string;
    await payment.save();

    const user = await this.userModel.findById(payment.user);
    if (!user) return res.json({ received: true });

    const paymentType = session.metadata?.paymentType;

    if (paymentType === 'subscription') {
      await this.handleSubscriptionPayment(session, payment, user, res);
    } else {
      return res.json({ received: true });
    }
  }

  // ===============================
  // SUBSCRIPTION LOGIC
  // ===============================
  private async handleSubscriptionPayment(
    session: Stripe.Checkout.Session,
    payment: PaymentDocument,
    user: UserDocument,
    res: Response,
  ) {
    const subscriber = await this.subscriberModel.findById(payment.subscriber);
    if (!subscriber) return res.json({ received: true });

    // Add user to subscriber's users array if not already present
    const alreadyAdded = subscriber.users?.some((id) => id.equals(user._id));
    if (!alreadyAdded) {
      subscriber.users = subscriber.users ?? [];
      subscriber.users.push(user._id);
      await subscriber.save();
    }

    // Calculate expiry using `days` from metadata
    const days = parseInt(session.metadata?.days ?? '0', 10);
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + days);

    user.isSubscribed = true;
    user.subscribers = subscriber._id;
    user.subscriptionEndDate = expireDate;
    await user.save();

    return res.json({ received: true });
  }

  // ===============================
  // PAYMENT FAILED
  // ===============================
  private async handlePaymentFailed(event: Stripe.Event, res: Response) {
    const intent = event.data.object as Stripe.PaymentIntent;

    const payment = await this.paymentModel.findOne({
      stripePaymentIntentId: intent.id,
    });

    if (payment) {
      payment.status = 'failed';
      await payment.save();
    }

    return res.json({ received: true });
  }
}
