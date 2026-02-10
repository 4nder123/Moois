import { betterAuth } from "better-auth/minimal";
import { emailOTP } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { emailService } from "../services/email";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_BASE_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    cookies: {
      session_token: {
        name: "SID",
        attributes: {
          sameSite: "strict",
        },
      },
      session_data: {
        name: "SID_DATA",
        attributes: {
          sameSite: "strict",
        },
      }
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
      async sendVerificationOTP({ email, otp, type }, request) {
        if (type !== "sign-in") return;
        await emailService.sendSignInOTP(
          email,
          otp,
          request as unknown as Request,
        );
      },
    }),
  ],
});
