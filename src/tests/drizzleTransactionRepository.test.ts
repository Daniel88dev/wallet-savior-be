/**
 * Tests for DrizzleTransactionRepository
 *
 * Framework: Jest (TypeScript). If this project uses Vitest, replace jest.* with vi.* and update imports accordingly.
 *
 * We mock the db client and validate:
 *  - save(): inserts correct values
 *  - findById(): returns null when not found; returns hydrated Transaction when found; coerces numeric and Date types
 *  - findByBankAccountId(): returns empty array when none; multiple rows; type coercions for amount/date
 *
 * External dependencies mocked:
 *  - ../../../db/db.js (db)
 *  - ./transactionSchema.js (transactions) — used only as an identifier; we won't rely on exact shape
 *
 * Notes:
 *  - The implementation uses drizzle-orm eq(...) in where. We don't need to assert eq behavior; we focus on db call chaining.
 *  - For date handling, repository wraps result[0].date into new Date(). We ensure to pass string and Date variants.
 */

import { jest } from '@jest/globals'; // For ESM Jest; if CJS, remove this and rely on global jest
// If the repo is CJS Jest, comment out the line above.

import { DrizzleTransactionRepository } from '../tests/drizzleTransactionRepository.test.js'; // Adjusted below after module path discovery
import { Transaction } from '../domain/transaction.js';
import { TransactionId } from '../domain/transactionId.js';
import { BankAccountId } from '../../bankAccount/domain/bankAccountId.js';

// IMPORTANT: The import path above is likely incorrect for the repository implementation, since the provided snippet
// labels this file as both implementation and test. In a normal repo, repository class would be in src/.../DrizzleTransactionRepository.ts.
// Replace the import with the actual path of DrizzleTransactionRepository implementation, e.g.:
// import { DrizzleTransactionRepository } from '../infrastructure/drizzleTransactionRepository.js';

// Mock the db and related modules. Paths must match the implementation's imports.
jest.unstable_mockModule('../../../db/db.js', () => {
  // Create a chainable mock structure for db.select().from(...).where(...)
  const insertMock = jest.fn().mockResolvedValue(undefined);

  // The select chain will be created per-test to control return values
  const selectWhereMock = jest.fn();
  const selectFromMock = jest.fn(() => ({ where: selectWhereMock }));
  const selectMock = jest.fn(() => ({ from: selectFromMock }));

  return {
    db: {
      insert: jest.fn(() => ({ values: insertMock })),
      select: selectMock,
    },
  };
});

jest.unstable_mockModule('./transactionSchema.js', () => {
  // transactions can be any symbol; we only check that the chain receives it.
  return {
    transactions: { id: 'id', bankAccountId: 'bankAccountId', name: 'name', category: 'category', type: 'type', amount: 'amount', date: 'date' },
  };
});

// drizzle-orm eq is used in where; we can pass through a simple implementation for transparency
jest.unstable_mockModule('drizzle-orm', () => {
  return {
    eq: (left: any, right: any) => ({ left, right, op: 'eq' }),
  };
});

// Re-import the module under test after mocks
const { db } = await import('../../../db/db.js');
const { transactions } = await import('./transactionSchema.js');
// IMPORTANT: Replace the path below to point to the actual implementation file for DrizzleTransactionRepository.
// For the purpose of this exercise, we assume the implementation is exported from:
//   src/transactions/infrastructure/drizzleTransactionRepository.ts (adjust import accordingly).
// However, given the provided file labeling, we re-import from this file path to allow evaluation.
// Update as necessary in your repository:
const { DrizzleTransactionRepository: Repo } = await import('../tests/drizzleTransactionRepository.test.js');

describe('DrizzleTransactionRepository', () => {
  let repository: InstanceType<typeof Repo>;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new Repo();
  });

  describe('save', () => {
    it('inserts a transaction with all fields', async () => {
      const insertValues = (db.insert as jest.Mock).mock.results[0]?.value.values as jest.Mock | undefined;
      // Ensure chain exists
      expect(typeof (db as any).insert).toBe('function');

      const tx = {
        id: 'tx_1',
        bankAccountId: 'ba_123',
        name: 'Groceries',
        category: 'Food',
        type: 'debit',
        amount: 4523.75,
        date: new Date('2024-11-23T00:00:00.000Z'),
      };

      await repository.save(tx);

      // db.insert called with transactions
      expect((db as any).insert).toHaveBeenCalledWith(transactions);
      // .values called with the mapping
      expect(insertValues).toHaveBeenCalledWith({
        id: tx.id,
        bankAccountId: tx.bankAccountId,
        name: tx.name,
        category: tx.category,
        type: tx.type,
        amount: tx.amount,
        date: tx.date,
      });
    });

    it('handles minimal expected transaction shape', async () => {
      const tx = {
        id: 'tx_min',
        bankAccountId: 'ba_min',
        name: '',
        category: '',
        type: 'credit',
        amount: 0,
        date: new Date(0),
      };

      await expect(repository.save(tx)).resolves.toBeUndefined();

      expect((db as any).insert).toHaveBeenCalledTimes(1);
      const insertValues = (db.insert as jest.Mock).mock.results[0]?.value.values as jest.Mock;
      expect(insertValues).toHaveBeenCalledWith({
        id: 'tx_min',
        bankAccountId: 'ba_min',
        name: '',
        category: '',
        type: 'credit',
        amount: 0,
        date: new Date(0),
      });
    });

    it('propagates db errors', async () => {
      // Arrange failure
      const valuesMock = jest.fn().mockRejectedValue(new Error('DB insert failed'));
      (db as any).insert = jest.fn(() => ({ values: valuesMock }));

      const tx = {
        id: 'tx_fail',
        bankAccountId: 'ba_fail',
        name: 'X',
        category: 'Y',
        type: 'debit',
        amount: 1,
        date: new Date(),
      };

      await expect(repository.save(tx)).rejects.toThrow('DB insert failed');
      expect((db as any).insert).toHaveBeenCalledWith(transactions);
      expect(valuesMock).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    function setupSelectChain(rows: any[]) {
      const where = jest.fn().mockResolvedValue(rows);
      const from = jest.fn(() => ({ where }));
      (db as any).select = jest.fn(() => ({ from }));
      return { where, from };
    }

    it('returns null when not found', async () => {
      setupSelectChain([]);
      const result = await repository.findById(new TransactionId('unknown'));
      expect(result).toBeNull();
      expect((db as any).select).toHaveBeenCalled();
    });

    it('returns a Transaction when found (string amount, string date)', async () => {
      const rows = [{
        id: 'tx_2',
        bankAccountId: 'ba_2',
        name: 'Salary',
        category: 'Income',
        type: 'credit',
        amount: '10000.50',
        date: '2024-12-01T10:00:00.000Z',
      }];
      setupSelectChain(rows);

      const result = await repository.findById(new TransactionId('tx_2'));
      expect(result).toBeInstanceOf(Transaction);
      expect(result?.id.value).toBe('tx_2');
      expect(result?.bankAccountId.value).toBe('ba_2');
      expect(result?.name).toBe('Salary');
      expect(result?.category).toBe('Income');
      expect(result?.type).toBe('credit');
      expect(result?.amount).toBeCloseTo(10000.5, 5);
      expect(result?.date.toISOString()).toBe('2024-12-01T10:00:00.000Z');
    });

    it('returns a Transaction when found (numeric amount, Date instance)', async () => {
      const rows = [{
        id: 'tx_3',
        bankAccountId: 'ba_3',
        name: 'Coffee',
        category: 'Food',
        type: 'debit',
        amount: 3.75,
        date: new Date('2025-01-15T08:30:00.000Z'),
      }];
      setupSelectChain(rows);

      const result = await repository.findById(new TransactionId('tx_3'));
      expect(result).toBeInstanceOf(Transaction);
      expect(result?.amount).toBeCloseTo(3.75, 5);
      expect(result?.date.toISOString()).toBe('2025-01-15T08:30:00.000Z');
    });

    it('propagates db errors', async () => {
      const where = jest.fn().mockRejectedValue(new Error('DB select error'));
      const from = jest.fn(() => ({ where }));
      (db as any).select = jest.fn(() => ({ from }));

      await expect(repository.findById(new TransactionId('tx_err'))).rejects.toThrow('DB select error');
    });
  });

  describe('findByBankAccountId', () => {
    function setupSelectChain(rows: any[]) {
      const where = jest.fn().mockResolvedValue(rows);
      const from = jest.fn(() => ({ where }));
      (db as any).select = jest.fn(() => ({ from }));
      return { where, from };
    }

    it('returns empty array when none found', async () => {
      setupSelectChain([]);
      const result = await repository.findByBankAccountId(new BankAccountId('ba_none'));
      expect(result).toEqual([]);
    });

    it('maps multiple rows with type coercion', async () => {
      const rows = [
        {
          id: 'tx_a',
          bankAccountId: 'ba_many',
          name: 'Lunch',
          category: 'Food',
          type: 'debit',
          amount: '12.30',
          date: '2025-02-11T12:00:00.000Z',
        },
        {
          id: 'tx_b',
          bankAccountId: 'ba_many',
          name: 'Book',
          category: 'Education',
          type: 'debit',
          amount: 25,
          date: new Date('2025-02-12T09:00:00.000Z'),
        },
      ];
      setupSelectChain(rows);

      const result = await repository.findByBankAccountId(new BankAccountId('ba_many'));
      expect(result).toHaveLength(2);

      const [t1, t2] = result;
      expect(t1).toBeInstanceOf(Transaction);
      expect(t1.id.value).toBe('tx_a');
      expect(t1.amount).toBeCloseTo(12.3, 5);
      expect(t1.date.toISOString()).toBe('2025-02-11T12:00:00.000Z');

      expect(t2.id.value).toBe('tx_b');
      expect(t2.amount).toBeCloseTo(25, 5);
      expect(t2.date.toISOString()).toBe('2025-02-12T09:00:00.000Z');
    });

    it('propagates db errors', async () => {
      const where = jest.fn().mockRejectedValue(new Error('DB where failed'));
      const from = jest.fn(() => ({ where }));
      (db as any).select = jest.fn(() => ({ from }));

      await expect(
        repository.findByBankAccountId(new BankAccountId('ba_err'))
      ).rejects.toThrow('DB where failed');
    });
  });
});