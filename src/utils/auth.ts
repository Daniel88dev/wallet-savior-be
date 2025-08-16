import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/db.js";
import { tempEmailSend } from "./tempEmail.js";
import { haveIBeenPwned, openAPI } from "better-auth/plugins";
import { Request } from "express";
import { fromNodeHeaders } from "better-auth/node";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      await tempEmailSend({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to verify your email: ${url}, token: ${token}`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      await tempEmailSend({
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}, token: ${token}`,
      });
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  rateLimit: {
    enabled: true,
    window: 10,
    max: 5,
  },
  plugins: [haveIBeenPwned(), openAPI()],
});

export type AuthSession = {
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  emailVerified: boolean;
};

export const getAuthSession = async (
  request: Request
): Promise<AuthSession> => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(request.headers),
  });
  if (!session) throw new Error("notAuthenticated");

  return {
    sessionId: session.session.id,
    userId: session.user.id,
    userName: session.user.name,
    userEmail: session.user.email,
    emailVerified: session.user.emailVerified,
  };
};
