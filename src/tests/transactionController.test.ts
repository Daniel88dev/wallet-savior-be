import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";

// --- IMPORTANT: mocks must target the exact module path that the controller imports ---
// Mock the actual path used by transactionController (utils/getAuthSession.js)
vi.mock("../utils/getAuthSession.js", () => ({
  getAuthSession: vi.fn(),
}));

// Mock addTransaction module: provide both `AddTransaction` and `addTransaction` exports
vi.mock("../modules/transactions/application/addTransaction.js", () => {
  const mockExecute = vi.fn();
  return {
    AddTransaction: vi.fn().mockImplementation(() => ({
      execute: mockExecute,
    })),
    addTransaction: {
      execute: mockExecute,
    },
  };
});

// Now import the handler and the mocked functions (imports must come after vi.mock calls)
import { addTransactionHandler } from "../modules/transactions/interfaces/transactionController.js";
import { getAuthSession } from "../utils/getAuthSession.js";
import { addTransaction } from "../modules/transactions/application/addTransaction.js";

describe("TransactionController - addTransactionHandler", () => {
  let req: Partial<Request> & { body?: any };
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      body: {
        bankAccountId: "2A0E99A1-53E5-4B9F-BA3B-1C6E0C48276F",
        name: "Transaction test",
        category: "none",
        type: "INCOME",
        amount: 123.45,
        date: new Date(2025, 5, 1).toISOString(),
      },
      headers: {},
    };

    res = {
      status: vi.fn().mockImplementation(function (this: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this;
      }),
      json: vi.fn().mockImplementation(function (this: any, payload: any) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return payload;
      }),
    };

    next = vi.fn() as unknown as NextFunction;
  });

  it("should create new transaction and return 201 response", async () => {
    // @ts-expect-error - mock import
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    (getAuthSession as unknown as vi.Mock).mockResolvedValue({
      sessionId: "s",
      userId: "u",
      userName: "n",
      userEmail: "e",
      emailVerified: true,
    });

    const returnedTransaction = {
      id: "some-id",
      bankAccountId: req.body!.bankAccountId,
      name: req.body!.name,
      category: req.body!.category,
      type: req.body!.type,
      amount: req.body!.amount,
      date: new Date(req.body!.date),
    };
    (addTransaction.execute as unknown as vi.Mock).mockResolvedValue(
      returnedTransaction
    );

    await addTransactionHandler(req as Request, res as Response, next);

    expect(getAuthSession).toHaveBeenCalledWith(req);
    expect(addTransaction.execute).toHaveBeenCalledWith(
      req.body!.bankAccountId,
      req.body!.name,
      req.body!.category,
      req.body!.amount,
      req.body!.type,
      new Date(req.body!.date)
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(returnedTransaction);
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next with error when getAuthSession throws", async () => {
    const error = new Error("auth failed");
    (getAuthSession as unknown as vi.Mock).mockRejectedValue(error);

    await addTransactionHandler(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("should call next with error when addTransaction.execute throws", async () => {
    (getAuthSession as unknown as vi.Mock).mockResolvedValue({
      sessionId: "s",
      userId: "u",
      userName: "n",
      userEmail: "e",
      emailVerified: true,
    });
    const error = new Error("save failed");
    (addTransaction.execute as unknown as vi.Mock).mockRejectedValue(error);

    await addTransactionHandler(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
