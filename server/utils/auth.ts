import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import Database from "better-sqlite3";

export const auth = betterAuth({
  database: new Database(".data/auth.sqlite"),
  advanced: {
    cookies: {
      session_token: {
        name: process.env.NODE_ENV === "production" ? "__Host-SID" : "SID",
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
