import { sumArray } from "./utils";

export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export interface Account {
  id: number;
  code: string;
  name: string;
  type: AccountType;
  description?: string;
  parentId?: number;
  isActive: boolean;
  balance?: number;
}

export interface JournalEntry {
  id: number;
  date: Date;
  reference?: string;
  description: string;
  lines: JournalLine[];
}

export interface JournalLine {
  id: number;
  journalEntryId: number;
  accountId: number;
  description?: string;
  debit: number | string;
  credit: number | string;
}

// Calculate account balance based on account type and debit/credit amounts
export function calculateAccountBalance(
  account: Account,
  debits: number[],
  credits: number[]
): number {
  const totalDebit = sumArray(debits);
  const totalCredit = sumArray(credits);
  
  switch (account.type) {
    case "asset":
    case "expense":
      // Debit increases, credit decreases
      return totalDebit - totalCredit;
    
    case "liability":
    case "equity":
    case "revenue":
      // Credit increases, debit decreases
      return totalCredit - totalDebit;
    
    default:
      return 0;
  }
}

// Check if a journal entry is balanced (debits = credits)
export function isJournalEntryBalanced(lines: JournalLine[]): boolean {
  const totalDebit = lines.reduce(
    (sum, line) => sum + parseFloat(line.debit.toString() || "0"),
    0
  );
  
  const totalCredit = lines.reduce(
    (sum, line) => sum + parseFloat(line.credit.toString() || "0"),
    0
  );
  
  // Using small epsilon for floating point comparison
  return Math.abs(totalDebit - totalCredit) < 0.001;
}

// Calculate totals for financial statements
export function calculateFinancialStatementTotals(accounts: Account[]) {
  const totalAssets = sumArray(
    accounts
      .filter((account) => account.type === "asset" && account.balance !== undefined)
      .map((account) => account.balance as number)
  );
  
  const totalLiabilities = sumArray(
    accounts
      .filter((account) => account.type === "liability" && account.balance !== undefined)
      .map((account) => account.balance as number)
  );
  
  const totalEquity = sumArray(
    accounts
      .filter((account) => account.type === "equity" && account.balance !== undefined)
      .map((account) => account.balance as number)
  );
  
  const totalRevenue = sumArray(
    accounts
      .filter((account) => account.type === "revenue" && account.balance !== undefined)
      .map((account) => account.balance as number)
  );
  
  const totalExpenses = sumArray(
    accounts
      .filter((account) => account.type === "expense" && account.balance !== undefined)
      .map((account) => account.balance as number)
  );
  
  const netIncome = totalRevenue - totalExpenses;
  
  return {
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
    totalRevenue,
    totalExpenses,
    netIncome,
  };
}

// Group accounts by type for reporting
export function groupAccountsByType(accounts: Account[]) {
  return {
    assets: accounts.filter((account) => account.type === "asset"),
    liabilities: accounts.filter((account) => account.type === "liability"),
    equity: accounts.filter((account) => account.type === "equity"),
    revenue: accounts.filter((account) => account.type === "revenue"),
    expenses: accounts.filter((account) => account.type === "expense"),
  };
}
