import nodemailer from "nodemailer";
import { p } from "vue-router/dist/router-CWoNjPRp.mjs";

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;

const translations = {
  en: {
    subject: "Sign-In Verification Code",
    title: "Your Sign-In Verification Code",
    expiresText: "This code will expire within 5 minutes.",
  },
  et: {
    subject: "Sisselogimise kood",
    title: "Teie sisselogimise kood",
    expiresText: "See kood aegub 5 minuti jooksul.",
  },
};

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

const getLocale = (request?: Request | undefined) => {
  const cookieHeader = request?.headers?.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)i18n_redirected=([^;]+)/);
  if (match?.[1] === "en") return "en";
  return "et";
};

const createEmail = (otp: string, locale: "en" | "et") => ({
  subject: translations[locale].subject,
  text: `${translations[locale].title}: ${otp}\n${translations[locale].expiresText}`,
  html: `
    <div style="font-family: Arial, sans-serif; margin: 24px auto; text-align: center;">
      <div style="display: inline-block; padding: 24px; border-radius: 4px; background: #ffffff; box-shadow: 0 6px 24px rgba(0,0,0,0.08); border: 1px solid #eee; width: auto;">
        <h2 style="margin: 0 0 12px;">${translations[locale].title}</h2>
        <p style="margin: 0 0 16px; color: #666;">${translations[locale].expiresText}</p>
        <div style="display: inline-block; padding: 12px 16px; border-radius: 4px; background: #f6f6f6; border: 1px solid #e0e0e0; font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #333; user-select: all;">
          ${otp}
        </div>
      </div>
    </div>
  `,
});

export const emailService = {
  sendSignInOTP: async (
    email: string,
    otp: string,
    request?: Request | undefined,
  ) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`OTP for ${email}: ${otp}`);
      return;
    }
    const locale = getLocale(request);
    const emailContent = createEmail(otp, locale);

    if (!transporter) {
      console.log(`OTP for ${email}: ${otp}`);
      return;
    }

    await transporter.sendMail({
      from: `Moois <${gmailUser}>`,
      to: email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html,
    });
  },
};
