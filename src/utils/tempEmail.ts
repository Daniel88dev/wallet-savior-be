import { logger } from "./logger.js";

type TempEmailType = {
  to: string;
  subject: string;
  text: string;
};

export const tempEmailSend = async (emailData: TempEmailType) => {
  await new Promise((resolve) => setTimeout(resolve, 25));
  logger.info(
    "Sending email to: " +
      emailData.to +
      " with subject: " +
      emailData.subject +
      " and text: " +
      emailData.text
  );
};
