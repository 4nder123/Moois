import { betterAuth } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import nodemailer from "nodemailer";
import { prisma } from "./prisma";

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;

const transporter =
  gmailUser && gmailPass
    ? nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      })
    : null;

const getLocale = (request?: Request) => {
  const cookieHeader = request?.headers.get("cookie") ?? "";
  const cookieMatch = cookieHeader.match(
    /(?:^|;\s*)(i18n_redirected|i18n_locale|locale)=([^;]+)/i,
  );
  const cookieLocale = cookieMatch?.[2]?.toLowerCase();
  if (cookieLocale?.startsWith("et")) return "et";

  const acceptLanguage = request?.headers.get("accept-language")?.toLowerCase();
  if (acceptLanguage?.includes("et")) return "et";

  return "en";
};

const signInCopy = {
  en: {
    subject: "Your sign-in code",
    text: (otp: string) => `Your sign-in code is: ${otp}`,
    html: (otp: string) =>
      `<p>Your sign-in code is:</p><p><strong>${otp}</strong></p>`,
  },
  et: {
    subject: "Sisselogimise kood",
    text: (otp: string) => `Sinu sisselogimise kood on: ${otp}`,
    html: (otp: string) =>
      `<p>Sinu sisselogimise kood on:</p><p><strong>${otp}</strong></p>`,
  },
} as const;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  session: {
    expiresIn: 60 * 60 * 24 * 30,
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
      async sendVerificationOTP({ email, otp, type }, request) {
        if (type !== "sign-in") return;
        const locale = getLocale(request);
        const subject = signInCopy[locale].subject;
        const body = signInCopy[locale];
        if (!transporter) {
          console.warn("Gmail credentials are not set; cannot send OTP email.");
          console.log(`OTP for ${email} (${type}): ${otp}`);
          return;
        }
        await transporter.sendMail({
          from: `Moois <${gmailUser}>`,
          to: email,
          subject,
          text: body.text(otp),
          html: body.html(otp),
        });
      },
    }),
  ],
});
