import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI, // Ensure this is set in .env
  bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE,
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
    accessTokenExpires: process.env.ACCESS_TOKEN_EXPIRES,
    refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshTokenExpires: process.env.REFRESH_TOKEN_EXPIRES,
  },
  cloudinary: {
    name: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  email: {
    expires: process.env.EMAIL_EXPIRES,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    address: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    admin: process.env.ADMIN_EMAIL,
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  frontendUrl: process.env.FRONTEND_URL,
  rateLimit: {
    window: process.env.RATE_LIMIT_WINDOW,
    max: process.env.RATE_LIMIT_MAX,
    delay: process.env.RATE_LIMIT_DELAY,
  },
  mpass: {
    mpass_base_url: process.env.MPESA_BASE_URL,
    mpass_consumer_key: process.env.CONSUMER_KEY,
    mpass_consumer_secret: process.env.CONSUMER_SECRET,
    mpass_shortcode: process.env.SHORTCODE,
    mpass_passkey: process.env.PASSKEY,
    mpass_callback_url: process.env.CALLBACK_URL,
  },
  googlemap_apikey: process.env.GOOGLE_MAPS_API_KEY,
};
