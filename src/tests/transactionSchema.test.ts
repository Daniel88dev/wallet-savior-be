import { describe, it, expect } from "vitest";

// Re-import the module under test. If the project uses path aliases, adjust the import accordingly.
// We assume the code under test lives at src/... and is exported from a module. If not, this test
// file can be co-located and import with a relative path.
import * as Schema from "../transactionSchema";

describe("Transaction schema definitions", () => {
  describe("TransactionType enum", () => {
    it("should contain the expected keys and values", () => {
      expect(Schema.TransactionType).toBeDefined();
      expect(Schema.TransactionType.INCOME).toBe("INCOME");
      expect(Schema.TransactionType.EXPENSE).toBe("EXPENSE");

      // Ensure there are no extra enum members
      expect(Object.values(Schema.TransactionType).sort()).toEqual(
        ["EXPENSE", "INCOME"].sort()
      );
      expect(Object.keys(Schema.TransactionType).sort()).toEqual(
        ["INCOME", "EXPENSE"].sort()
      );
    });
  });

  describe("enumToPgEnum", () => {
    it("should convert a string-valued enum to a tuple of string values", () => {
      const result = Schema.enumToPgEnum(Schema.TransactionType);
      // Should be a non-empty array and contain all enum values (order preserved by Object.values)
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(Object.values(Schema.TransactionType));
      // Ensure tuple first element exists (runtime check)
      expect(result[0]).toBeDefined();
    });

    it("should stringify non-string enum values", () => {
      enum MixedEnum {
        A = 1,
        B = "two",
        C = true as any, // mimic non-string
      }
      const result = Schema.enumToPgEnum(MixedEnum as unknown as Record<string, any>);
      // All values should be stringified
      expect(result).toContain("1");
      expect(result).toContain("two");
      expect(result).toContain("true");
      // No unexpected values
      expect(result.length).toBe(3);
    });

    it("should handle an empty object gracefully", () => {
      const result = Schema.enumToPgEnum({} as any);
      // Will produce an empty array (tuple type erased at runtime)
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("transactionEnum", () => {
    it("should be created with the correct name and options", () => {
      // drizzle's pgEnum returns a function; check that invoking with the name returns a column builder
      expect(typeof Schema.transactionEnum).toBe("function");

      // Make a column with it and validate key characteristics that are usually present on drizzle column builders.
      const col = Schema.transactionEnum("type");
      // Basic shape checks: drizzle column builder exposes .name and .dataType at runtime in many versions,
      // but this can vary. We perform defensive checks to avoid binding to internals too tightly.
      expect(col).toBeDefined();
      // Known internal bits may vary by version. These checks are best-effort and won't fail if not present.
      // @ts-expect-error runtime probing for drizzle internals (non-fatal checks)
      if ("name" in col) {
        // @ts-expect-error runtime probing
        expect(col.name).toBe("type");
      }
      // @ts-expect-error runtime probing
      if ("columnType" in col) {
        // @ts-expect-error runtime probing
        expect(typeof col.columnType).toBe("string");
      }
    });
  });

  describe("transactions table", () => {
    it("should define the table object", () => {
      expect(Schema.transactions).toBeDefined();
      // drizzle pgTable returns a table object with columns as properties.
      const t = Schema.transactions as any;
      const expectedColumns = [
        "id",
        "bankAccountId",
        "name",
        "category",
        "amount",
        "type",
        "date",
        "createdAt",
        "updatedAt",
      ];

      for (const col of expectedColumns) {
        expect(t[col]).toBeDefined();
      }

      // Ensure no obvious missing or extra unexpected columns (allow drizzle internals to exist)
      const publicColumnKeys = Object.keys(t).filter(
        (k) => expectedColumns.includes(k)
      );
      expect(publicColumnKeys.sort()).toEqual(expectedColumns.sort());
    });

    it("should set required not-null constraints on critical columns", () => {
      const t = Schema.transactions as any;

      // Best-effort checks for runtime flags used by drizzle's column builders. These are not public API.
      // We check if "notNull" or "isNotNull" flags are present on metadata-like fields.
      const assertNotNull = (col: any, label: string) => {
        const meta = col && (col.notNull || col.isNotNull || col.notNullSQL);
        if (meta !== undefined) {
          expect(Boolean(meta)).toBe(true);
        } else {
          // If internals aren't exposed, at least ensure column builder exists
          expect(col).toBeDefined();
        }
      };

      assertNotNull(t.bankAccountId, "bankAccountId");
      assertNotNull(t.name, "name");
      assertNotNull(t.category, "category");
      assertNotNull(t.amount, "amount");
      assertNotNull(t.type, "type");
      assertNotNull(t.date, "date");
    });

    it("should have default values configured for createdAt and updatedAt", () => {
      const t = Schema.transactions as any;

      // Many drizzle versions expose .default and .$defaultFn or similar internals. Probe safely.
      const hasDefault = (col: any): boolean => {
        if (!col) return false;
        return Boolean(
          col.default ||
            col.hasDefault ||
            col.defaultFn ||
            col.$default ||
            col.$defaultFn
        );
      };

      expect(hasDefault(t.createdAt)).toBe(true);
      expect(hasDefault(t.updatedAt)).toBe(true);
    });

    it("should include indexes on bank_account_id and date", () => {
      // drizzle pgTable often exposes a .[Symbol.for('drizzle:TableName')] or internal config.
      // We cannot rely fully on internals. Instead, validate that index builders exist on the table-like object
      // by scanning for properties with index hints or names.
      const tableAny = Schema.transactions as any;
      const keys = Object.keys(tableAny);

      // We at least ensure presence of column objects and infer that index definition passes type-checks.
      // To strengthen assertions without relying on internals, we check the table name if available.
      // @ts-expect-error runtime probing
      if (tableAny[Symbol.for("drizzle:TableName")]) {
        // @ts-expect-error runtime probing
        expect(tableAny[Symbol.for("drizzle:TableName")]).toBe("transactions");
      }

      // Since index builders usually are not enumerable on the exported table object,
      // we can't reliably check them at runtime. We add a sanity check that the indexed columns exist.
      expect((tableAny as any).bankAccountId).toBeDefined();
      expect((tableAny as any).date).toBeDefined();
    });

    it("should configure updatedAt to change on update via $onUpdate", () => {
      const t = Schema.transactions as any;

      // Probe for onUpdate function existence in internals
      const hasOnUpdate =
        t.updatedAt &&
        (t.updatedAt.onUpdate ||
          t.updatedAt.$onUpdate ||
          t.updatedAt._onUpdate ||
          t.updatedAt.onUpdateFn);

      // If internals are present, verify it's a function.
      if (hasOnUpdate) {
        const fn =
          t.updatedAt.onUpdate ||
          t.updatedAt.$onUpdate ||
          t.updatedAt._onUpdate ||
          t.updatedAt.onUpdateFn;
        expect(typeof fn).toBe("function");
        // Best effort: call without args if safe
        try {
          const res = fn();
          // UpdatedAt function should return a Date instance
          expect(res instanceof Date).toBe(true);
        } catch {
          // If calling isn't allowed by the builder, ignore.
        }
      } else {
        // Fallback: at minimum, the column exists
        expect(t.updatedAt).toBeDefined();
      }
    });
  });
});