// TypeScript
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { CreateBankAccount } from "../../modules/bankAccount/application/createBankAccount.js";
import { BankAccountRepository } from "../../modules/bankAccount/domain/bankAccountRepository.js";
import { CurrencyType } from "../../modules/bankAccount/infrastructure/bankAccountSchema.js";
import { BankAccount } from "../../modules/bankAccount/domain/bankAccount.js";
import { BankAccountId } from "../../modules/bankAccount/domain/bankAccountId.js";
import { UserId } from "../../modules/user/domain/userId.js";

vi.mock("uuid", () => {
  return {
    v4: () => "00000000-0000-4000-8000-000000000000",
  };
});

describe("CreateBankAccount", () => {
  let repoMock: BankAccountRepository;
  let saveMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    saveMock = vi.fn().mockResolvedValue(undefined);
    repoMock = {
      save: saveMock,
      findById: vi.fn() as any,
      findByUserId: vi.fn() as any,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates a BankAccount, calls repository.save and returns the account", async () => {
    const useCase = new CreateBankAccount(repoMock);

    const result = await useCase.execute(
      "user-123",
      "Primary Account",
      100,
      CurrencyType.USD,
      500
    );

    expect(saveMock).toHaveBeenCalledTimes(1);
    const savedArg = saveMock.mock.calls[0]![0] as BankAccount;

    expect(result).toBe(savedArg);

    expect(savedArg.id).toBeInstanceOf(BankAccountId);
    expect(savedArg.userId).toBeInstanceOf(UserId);
    expect(savedArg.userId.value).toBe("user-123");
    expect(savedArg.name).toBe("Primary Account");
    expect(savedArg.overdraft).toBe(100);
    expect(savedArg.currency).toBe(CurrencyType.USD);
    expect(savedArg.balance).toBe(500);

    expect(savedArg.id.value).toBe("00000000-0000-4000-8000-000000000000");
  });

  it("propagates repository.save errors", async () => {
    const error = new Error("db down");
    saveMock.mockRejectedValueOnce(error);
    const useCase = new CreateBankAccount(repoMock);

    await expect(
      useCase.execute("user-2", "Err Account", 0, CurrencyType.EUR, 0)
    ).rejects.toThrow("db down");

    expect(saveMock).toHaveBeenCalledTimes(1);
  });
});
