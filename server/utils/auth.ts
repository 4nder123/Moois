import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [
    "http://localhost:3000",
    "http://192.168.1.5:3000",
    "http://192.168.1.241:3000",
  ],
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
  user: {
    additionalFields: {
      timetableUrl: { type: "string", input: true, defaultValue: "" },
      homeworkUrl: { type: "string", input: true, defaultValue: "" },
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
