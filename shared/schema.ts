import { pgTable, text, serial, integer, numeric, timestamp, boolean, pgEnum, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Auth user model - basic structure to be extended with Clerk
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  role: text("role").default("user").notNull(),
  clerkId: text("clerk_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Client/Customer model
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  taxId: text("tax_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Invoice status enum
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft", "sent", "paid", "overdue", "cancelled"
]);

// Invoices model
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  clientId: integer("client_id").notNull(),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: invoiceStatusEnum("status").default("draft").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Invoice items model
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
});

// Expense categories enum
export const expenseCategoryEnum = pgEnum("expense_category", [
  "office", "travel", "marketing", "utilities", "rent", "salary", "equipment", "supplies", "taxes", "other"
]);

// Expenses model
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  category: expenseCategoryEnum("category").default("other").notNull(),
  notes: text("notes"),
  receipt: text("receipt_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Chart of accounts types enum
export const accountTypeEnum = pgEnum("account_type", [
  "asset", "liability", "equity", "revenue", "expense"
]);

// Chart of accounts model
export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  type: accountTypeEnum("type").notNull(),
  description: text("description"),
  parentId: integer("parent_id"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Journal entries model
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  reference: text("reference"),
  description: text("description").notNull(),
  sourceType: text("source_type"), // 'invoice', 'expense', 'manual'
  sourceId: integer("source_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Journal entry lines model
export const journalLines = pgTable("journal_lines", {
  id: serial("id").primaryKey(),
  journalEntryId: integer("journal_entry_id").notNull(),
  accountId: integer("account_id").notNull(),
  description: text("description"),
  debit: numeric("debit", { precision: 10, scale: 2 }).default("0").notNull(),
  credit: numeric("credit", { precision: 10, scale: 2 }).default("0").notNull(),
});

// Modelos para el portal de clientes y almacenamiento

// Enum para categorías de archivos
export const fileCategoryEnum = pgEnum("file_category", [
  "invoice", "quote", "receipt", "contract", "report", "tax", "other"
]);

// Modelo de archivos
export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  size: integer("size").notNull(),
  mimeType: text("mime_type").notNull(),
  clientId: integer("client_id"),
  companyId: integer("company_id"),
  category: fileCategoryEnum("category").default("other").notNull(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Modelo de invitaciones para clientes
export const clientInvitations = pgTable("client_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: integer("client_id").notNull(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertClientSchema = createInsertSchema(clients)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertInvoiceSchema = createInsertSchema(invoices)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems)
  .omit({ id: true });

export const insertExpenseSchema = createInsertSchema(expenses)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertAccountSchema = createInsertSchema(accounts)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertJournalEntrySchema = createInsertSchema(journalEntries)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertJournalLineSchema = createInsertSchema(journalLines)
  .omit({ id: true });

export const insertFileSchema = createInsertSchema(files)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertClientInvitationSchema = createInsertSchema(clientInvitations)
  .omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type ExpenseCategory = "office" | "travel" | "marketing" | "utilities" | "rent" | "salary" | "equipment" | "supplies" | "taxes" | "other";

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type AccountType = "asset" | "liability" | "equity" | "revenue" | "expense";

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;

export type JournalLine = typeof journalLines.$inferSelect;
export type InsertJournalLine = z.infer<typeof insertJournalLineSchema>;

export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type FileCategory = "invoice" | "quote" | "receipt" | "contract" | "report" | "tax" | "other";

export type ClientInvitation = typeof clientInvitations.$inferSelect;
export type InsertClientInvitation = z.infer<typeof insertClientInvitationSchema>;
