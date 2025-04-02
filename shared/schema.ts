import { pgTable, text, serial, integer, boolean, date, numeric, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enumeraciones para estados
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'pending', 'paid', 'overdue', 'canceled']);
export const expenseStatusEnum = pgEnum('expense_status', ['pending', 'paid', 'rejected']);

// Tabla de usuarios
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").default("user"),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabla de clientes
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  tax_id: text("tax_id"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabla de productos/servicios
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }),
  sku: text("sku"),
  tax_rate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabla de facturas
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoice_number: text("invoice_number").notNull().unique(),
  client_id: integer("client_id").notNull().references(() => clients.id),
  issue_date: date("issue_date").notNull(),
  due_date: date("due_date").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 10, scale: 2 }).notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  status: invoiceStatusEnum("status").default("draft"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabla de líneas de factura
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoice_id: integer("invoice_id").notNull().references(() => invoices.id),
  product_id: integer("product_id").references(() => products.id),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unit_price: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  tax_rate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
  line_total: numeric("line_total", { precision: 10, scale: 2 }).notNull(),
});

// Tabla de gastos
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  expense_number: text("expense_number").notNull().unique(),
  supplier_name: text("supplier_name").notNull(),
  date: date("date").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  tax_amount: numeric("tax_amount", { precision: 10, scale: 2 }).default("0"),
  category: text("category"),
  notes: text("notes"),
  status: expenseStatusEnum("status").default("pending"),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabla de asientos contables
export const ledgerEntries = pgTable("ledger_entries", {
  id: serial("id").primaryKey(),
  entry_number: text("entry_number").notNull().unique(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  is_posted: boolean("is_posted").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// Tabla de líneas de asiento contable
export const ledgerLines = pgTable("ledger_lines", {
  id: serial("id").primaryKey(),
  entry_id: integer("entry_id").notNull().references(() => ledgerEntries.id),
  account_code: text("account_code").notNull(),
  description: text("description"),
  debit: numeric("debit", { precision: 10, scale: 2 }).default("0"),
  credit: numeric("credit", { precision: 10, scale: 2 }).default("0"),
});

// Relaciones
export const usersRelations = relations(users, ({ many }) => ({
  invoices: many(invoices),
  expenses: many(expenses),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  invoices: many(invoices),
}));

export const productsRelations = relations(products, ({ many }) => ({
  invoiceItems: many(invoiceItems),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, {
    fields: [invoices.client_id],
    references: [clients.id],
  }),
  items: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoice_id],
    references: [invoices.id],
  }),
  product: one(products, {
    fields: [invoiceItems.product_id],
    references: [products.id],
  }),
}));

export const ledgerEntriesRelations = relations(ledgerEntries, ({ many }) => ({
  lines: many(ledgerLines),
}));

export const ledgerLinesRelations = relations(ledgerLines, ({ one }) => ({
  entry: one(ledgerEntries, {
    fields: [ledgerLines.entry_id],
    references: [ledgerEntries.id],
  }),
}));

// Esquemas de inserción
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
});

export const insertClientSchema = createInsertSchema(clients).pick({
  name: true,
  email: true,
  phone: true,
  address: true,
  tax_id: true,
  notes: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  cost: true,
  sku: true,
  tax_rate: true,
  is_active: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  invoice_number: true,
  client_id: true,
  issue_date: true,
  due_date: true,
  subtotal: true,
  tax: true,
  total: true,
  status: true,
  notes: true,
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).pick({
  invoice_id: true,
  product_id: true,
  description: true,
  quantity: true,
  unit_price: true,
  tax_rate: true,
  line_total: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  expense_number: true,
  supplier_name: true,
  date: true,
  amount: true,
  tax_amount: true,
  category: true,
  notes: true,
  status: true,
});

export const insertLedgerEntrySchema = createInsertSchema(ledgerEntries).pick({
  entry_number: true,
  date: true,
  description: true,
  is_posted: true,
});

export const insertLedgerLineSchema = createInsertSchema(ledgerLines).pick({
  entry_id: true,
  account_code: true,
  description: true,
  debit: true,
  credit: true,
});

// Tipos de inserción
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type InsertLedgerEntry = z.infer<typeof insertLedgerEntrySchema>;
export type InsertLedgerLine = z.infer<typeof insertLedgerLineSchema>;

// Tipos de selección
export type User = typeof users.$inferSelect;
export type Client = typeof clients.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type LedgerLine = typeof ledgerLines.$inferSelect;
