import {
  transactionEnum,
  transactions,
} from "../modules/transactions/infrastructure/transactionSchema.js";
import { bankAccounts } from "../modules/bankAccount/infrastructure/bankAccountSchema.js";
import { account, session, user, verification } from "./userSchema.js";

export const schema = {
  user,
  session,
  account,
  verification,
  transactionEnum,
  transactions,
  bankAccounts,
};
