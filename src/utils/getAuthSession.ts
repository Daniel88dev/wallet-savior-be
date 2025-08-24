import { Request } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.js";
import { ProjectError } from "../middleware/errorMiddleware.js";

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
  if (!session)
    throw new ProjectError({
      name: "notAuthenticated",
      message: "Need to authenticate first",
    });

  return {
    sessionId: session.session.id,
    userId: session.user.id,
    userName: session.user.name,
    userEmail: session.user.email,
    emailVerified: session.user.emailVerified,
  };
};
