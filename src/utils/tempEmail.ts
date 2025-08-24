import { logger } from "./logger.js";
import { ProjectError } from "../middleware/errorMiddleware.js";

type TempEmailType = {
  to: string;
  subject: string;
  text: string;
};

const maskEmail = (email: string) => {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  if (!local)
    throw new ProjectError({
      name: "validator",
      message: "Invalid email address",
    });
  const maskedLocal =
    local.length <= 2
      ? "*".repeat(local.length)
      : local[0] + "*".repeat(local.length - 2) + local.at(-1);
  return `${maskedLocal}@${domain}`;
};

export const tempEmailSend = async (emailData: TempEmailType) => {
  await new Promise((resolve) => setTimeout(resolve, 25));
  logger.info("tempEmail.send", {
    to: maskEmail(emailData.to),
    subject: emailData.subject,
    bodyPreviewChars: Math.min(emailData.text.length, 100),
  });
};
