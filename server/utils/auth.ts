import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: Number(process.env.POSTGRES_PORT),
  }),
  trustedOrigins: ["http://localhost:3000", "http://192.168.1.5:3000"],
  session: {
    maxAge: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    cookies: {
      session_token: {
        name: process.env.NODE_ENV === "production" ? "__Host-SID" : "SID",
        attributes: {
          sameSite: "strict",
        },
      },
    },
  },
  plugins: [
    emailOTP({
      storeOTP: "hashed",
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          console.log(`Sign-in OTP for ${email}: ${otp}`);
        }
      },
    }),
  ],
});
