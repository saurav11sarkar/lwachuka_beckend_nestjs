import { HttpException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import config from 'src/app/config';

@Injectable()
export class MpesaService {
  private readonly logger = new Logger(MpesaService.name);
  private readonly baseUrl = config.mpass.mpass_base_url;

  // ─── 1. AUTH ───────────────────────────────────────────────
  private basicAuth(): string {
    const key = config.mpass.mpass_consumer_key;
    const secret = config.mpass.mpass_consumer_secret;
    if (!key || !secret)
      throw new HttpException('M-Pesa credentials missing in .env', 500);
    return Buffer.from(`${key}:${secret}`).toString('base64');
  }

  async getAccessToken(): Promise<string> {
    try {
      const url = `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`;
      const res = await axios.get(url, {
        headers: { Authorization: `Basic ${this.basicAuth()}` },
        timeout: 15000,
      });
      return res.data.access_token;
    } catch (e: any) {
      const msg =
        e?.response?.data?.errorMessage ||
        e?.response?.data?.error ||
        e.message;
      this.logger.error(`getAccessToken failed: ${msg}`);
      throw new HttpException(`Failed to get M-Pesa token: ${msg}`, 500);
    }
  }

  // ─── 2. HELPERS ────────────────────────────────────────────
  private timestamp(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
      d.getFullYear() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  }

  private password(ts: string): string {
    const sc = config.mpass.mpass_shortcode;
    const pk = config.mpass.mpass_passkey;
    if (!sc || !pk)
      throw new HttpException('M-Pesa shortcode/passkey missing in .env', 500);
    return Buffer.from(`${sc}${pk}${ts}`).toString('base64');
  }

  // ─── 3. PHONE NORMALIZER ────────────────────────────────────
  // Accepts: 07XXXXXXXX | 01XXXXXXXX | +2547XXXXXXXX | 2547XXXXXXXX | 7XXXXXXXX
  normalizePhone(phone: string): string {
    let p = String(phone ?? '')
      .trim()
      .replace(/[\s\-]/g, '');

    if (p.startsWith('+')) p = p.slice(1); // remove +
    if (/^0[17]\d{8}$/.test(p)) p = '254' + p.slice(1); // 07x/01x → 254x
    if (/^[17]\d{8}$/.test(p)) p = '254' + p; // 7x → 2547x

    if (!/^254[17]\d{8}$/.test(p)) {
      throw new HttpException(
        'Invalid phone. Use: 07XXXXXXXX or +2547XXXXXXXX or 2547XXXXXXXX',
        400,
      );
    }
    return p;
  }

  // ─── 4. STK PUSH ───────────────────────────────────────────
  async stkPush(payload: {
    phone: string;
    amount: number;
    accountReference: string;
    transactionDesc: string;
  }) {
    const token = await this.getAccessToken();
    const ts = this.timestamp();
    const sc = config.mpass.mpass_shortcode;
    const cb = config.mpass.mpass_callback_url;

    console.log(cb);


    if (!cb) throw new HttpException('CALLBACK_URL missing in .env', 500);

    const phone = this.normalizePhone(payload.phone);
    const amount = Math.ceil(payload.amount); // M-Pesa requires whole number

    try {
      const url = `${this.baseUrl}/mpesa/stkpush/v1/processrequest`;
      const res = await axios.post(
        url,
        {
          BusinessShortCode: sc,
          Password: this.password(ts),
          Timestamp: ts,
          TransactionType: 'CustomerPayBillOnline',
          Amount: amount,
          PartyA: phone,
          PartyB: sc,
          PhoneNumber: phone,
          CallBackURL: cb,
          AccountReference: payload.accountReference,
          TransactionDesc: payload.transactionDesc,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 20000,
        },
      );

      this.logger.log(`STK Push sent → ${phone} | ${amount} KES`);
      console.log(res.data);
      return res.data;
    } catch (e: any) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      throw new HttpException(
        `STK Push failed: ${status ?? ''} ${data?.errorMessage || data?.error || e.message}`,
        500,
      );
    }
  }

  // ─── 5. PARSE CALLBACK ─────────────────────────────────────
  parseStkCallback(body: any) {
    const stk = body?.Body?.stkCallback;
    if (!stk) return null;

    const items: any[] = stk.CallbackMetadata?.Item || [];
    const get = (name: string) =>
      items.find((i) => i.Name === name)?.Value ?? null;

    return {
      resultCode: stk.ResultCode as number,
      resultDesc: stk.ResultDesc as string,
      checkoutRequestId: stk.CheckoutRequestID as string,
      merchantRequestId: stk.MerchantRequestID as string,
      mpesaReceiptNumber: get('MpesaReceiptNumber'),
      amount: get('Amount'),
      phoneNumber: get('PhoneNumber'),
      transactionDate: get('TransactionDate'),
      raw: body,
    };
  }
}
