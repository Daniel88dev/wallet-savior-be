import { z } from "zod";
import { UserId } from "./userId.js";

const UserNameSchema = z.string().trim().min(1);
const UserEmailSchema = z.email();

export class User {
  public readonly id: UserId;
  public name: string;
  public email: string;

  constructor(id: UserId, name: string, email: string) {
    this.id = id;
    this.name = UserNameSchema.parse(name);
    this.email = UserEmailSchema.parse(email);
  }
}
