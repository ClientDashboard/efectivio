import {
  users, clients, quotes, quoteItems, invoices, invoiceItems, expenses, accounts, journalEntries, journalLines,
  type User, type InsertUser, type Client, type InsertClient, type ClientType, type PaymentTerms,
  type Quote, type InsertQuote, type QuoteItem, type InsertQuoteItem, type QuoteStatus,
  type Invoice, type InsertInvoice, type InvoiceItem, type InsertInvoiceItem, type InvoiceStatus,
  type Expense, type InsertExpense, type Account, type InsertAccount,
  type JournalEntry, type InsertJournalEntry, type JournalLine, type InsertJournalLine
} from "@shared/schema";

import { db } from "./db";
import { eq, and, desc, sql, like, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";

// Storage interface
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByClerkId(clerkId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  searchClients(query: string): Promise<Client[]>;
  
  // Quotes/Presupuestos
  getQuotes(): Promise<Quote[]>;
  getQuotesByClient(clientId: number): Promise<Quote[]>;
  getQuote(id: number): Promise<Quote | undefined>;
  getQuoteWithItems(id: number): Promise<{quote: Quote, items: QuoteItem[]} | undefined>;
  createQuote(quote: InsertQuote, items: InsertQuoteItem[]): Promise<Quote>;
  updateQuote(id: number, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  updateQuoteStatus(id: number, status: QuoteStatus): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;
  convertQuoteToInvoice(quoteId: number): Promise<Invoice | undefined>;
  
  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoicesByClient(clientId: number): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoiceWithItems(id: number): Promise<{invoice: Invoice, items: InvoiceItem[]} | undefined>;
  createInvoice(invoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  updateInvoiceStatus(id: number, status: InvoiceStatus): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;
  
  // Expenses
  getExpenses(): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Chart of Accounts
  getAccounts(): Promise<Account[]>;
  getAccount(id: number): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: number, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: number): Promise<boolean>;
  
  // Journal Entries
  getJournalEntries(): Promise<JournalEntry[]>;
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  getJournalEntryWithLines(id: number): Promise<{entry: JournalEntry, lines: JournalLine[]} | undefined>;
  createJournalEntry(entry: InsertJournalEntry, lines: InsertJournalLine[]): Promise<JournalEntry>;
  updateJournalEntry(id: number, entry: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined>;
  deleteJournalEntry(id: number): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

// Implementation using database storage
export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Configurar PostgreSQL Session Store
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByClerkId(clerkId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.clerkId, clerkId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Client methods
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }
  
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }
  
  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }
  
  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set({ ...clientData, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return !!result;
  }
  
  async searchClients(query: string): Promise<Client[]> {
    const searchQuery = `%${query}%`;
    return await db
      .select()
      .from(clients)
      .where(
        or(
          like(clients.companyName || '', searchQuery),
          like(clients.displayName || '', searchQuery),
          like(clients.firstName || '', searchQuery),
          like(clients.lastName || '', searchQuery),
          like(clients.email || '', searchQuery)
        )
      );
  }

  // Quote methods
  async getQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes);
  }
  
  async getQuotesByClient(clientId: number): Promise<Quote[]> {
    return await db.select().from(quotes).where(eq(quotes.clientId, clientId));
  }
  
  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }
  
  async getQuoteWithItems(id: number): Promise<{quote: Quote, items: QuoteItem[]} | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    if (!quote) return undefined;
    
    const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, id));
    return { quote, items };
  }
  
  async createQuote(insertQuote: InsertQuote, items: InsertQuoteItem[]): Promise<Quote> {
    // Insert the quote
    const [quote] = await db.insert(quotes).values(insertQuote).returning();
    
    // Insert quote items with the quote ID
    if (items.length > 0) {
      await db.insert(quoteItems).values(
        items.map(item => ({
          ...item,
          quoteId: quote.id
        }))
      );
    }
    
    return quote;
  }
  
  async updateQuote(id: number, quoteData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const [updatedQuote] = await db
      .update(quotes)
      .set({ ...quoteData, updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();
    return updatedQuote;
  }
  
  async updateQuoteStatus(id: number, status: QuoteStatus): Promise<Quote | undefined> {
    const [updatedQuote] = await db
      .update(quotes)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(quotes.id, id))
      .returning();
    return updatedQuote;
  }
  
  async deleteQuote(id: number): Promise<boolean> {
    // Primero eliminamos los elementos de la cotización
    await db.delete(quoteItems).where(eq(quoteItems.quoteId, id));
    // Luego eliminamos la cotización
    const result = await db.delete(quotes).where(eq(quotes.id, id));
    return !!result;
  }
  
  async convertQuoteToInvoice(quoteId: number): Promise<Invoice | undefined> {
    const quoteWithItems = await this.getQuoteWithItems(quoteId);
    if (!quoteWithItems) return undefined;
    
    const { quote, items } = quoteWithItems;
    
    // Actualizamos el estado de la cotización
    await this.updateQuoteStatus(quoteId, "converted");
    
    // Creamos la factura
    const invoiceData: InsertInvoice = {
      clientId: quote.clientId,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      issueDate: new Date(),
      dueDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 días de plazo por defecto
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      total: quote.total,
      notes: `Generado desde cotización #${quote.quoteNumber}`,
      status: "draft"
    };
    
    // Creamos la factura con sus items
    const newInvoice = await this.createInvoice(
      invoiceData, 
      items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
        taxRate: item.taxRate,
        invoiceId: 0 // Este valor será reemplazado por el ID real en createInvoice
      }))
    );
    
    // Actualizamos la cotización para incluir el ID de la factura asociada
    await this.updateQuote(quoteId, {
      convertedToInvoiceId: newInvoice.id
    });
    
    return newInvoice;
  }
  
  // Invoice methods
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices);
  }
  
  async getInvoicesByClient(clientId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.clientId, clientId));
  }
  
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }
  
  async getInvoiceWithItems(id: number): Promise<{invoice: Invoice, items: InvoiceItem[]} | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return undefined;
    
    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    return { invoice, items };
  }
  
  async createInvoice(insertInvoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice> {
    // Insert the invoice
    const [invoice] = await db.insert(invoices).values(insertInvoice).returning();
    
    // Insert invoice items with the invoice ID
    if (items.length > 0) {
      await db.insert(invoiceItems).values(
        items.map(item => ({
          ...item,
          invoiceId: invoice.id
        }))
      );
    }
    
    return invoice;
  }
  
  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ ...invoiceData, updatedAt: new Date() })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }
  
  async updateInvoiceStatus(id: number, status: InvoiceStatus): Promise<Invoice | undefined> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
      .where(eq(invoices.id, id))
      .returning();
    return updatedInvoice;
  }
  
  async deleteInvoice(id: number): Promise<boolean> {
    // Primero eliminamos los elementos de la factura
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    // Luego eliminamos la factura
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return !!result;
  }
  
  // Expense methods
  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses);
  }
  
  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }
  
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db.insert(expenses).values(insertExpense).returning();
    return expense;
  }
  
  async updateExpense(id: number, expenseData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [updatedExpense] = await db
      .update(expenses)
      .set({ ...expenseData, updatedAt: new Date() })
      .where(eq(expenses.id, id))
      .returning();
    return updatedExpense;
  }
  
  async deleteExpense(id: number): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return !!result;
  }
  
  // Chart of Accounts methods
  async getAccounts(): Promise<Account[]> {
    return await db.select().from(accounts);
  }
  
  async getAccount(id: number): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }
  
  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const [account] = await db.insert(accounts).values(insertAccount).returning();
    return account;
  }
  
  async updateAccount(id: number, accountData: Partial<InsertAccount>): Promise<Account | undefined> {
    const [updatedAccount] = await db
      .update(accounts)
      .set({ ...accountData, updatedAt: new Date() })
      .where(eq(accounts.id, id))
      .returning();
    return updatedAccount;
  }
  
  async deleteAccount(id: number): Promise<boolean> {
    const result = await db.delete(accounts).where(eq(accounts.id, id));
    return !!result;
  }
  
  // Journal Entry methods
  async getJournalEntries(): Promise<JournalEntry[]> {
    return await db.select().from(journalEntries);
  }
  
  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    return entry;
  }
  
  async getJournalEntryWithLines(id: number): Promise<{entry: JournalEntry, lines: JournalLine[]} | undefined> {
    const [entry] = await db.select().from(journalEntries).where(eq(journalEntries.id, id));
    if (!entry) return undefined;
    
    const lines = await db.select().from(journalLines).where(eq(journalLines.journalEntryId, id));
    return { entry, lines };
  }
  
  async createJournalEntry(insertEntry: InsertJournalEntry, lines: InsertJournalLine[]): Promise<JournalEntry> {
    // Insert the journal entry
    const [entry] = await db.insert(journalEntries).values(insertEntry).returning();
    
    // Insert journal lines with the entry ID
    if (lines.length > 0) {
      await db.insert(journalLines).values(
        lines.map(line => ({
          ...line,
          journalEntryId: entry.id
        }))
      );
    }
    
    return entry;
  }
  
  async updateJournalEntry(id: number, entryData: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const [updatedEntry] = await db
      .update(journalEntries)
      .set({ ...entryData, updatedAt: new Date() })
      .where(eq(journalEntries.id, id))
      .returning();
    return updatedEntry;
  }
  
  async deleteJournalEntry(id: number): Promise<boolean> {
    // Primero eliminamos las líneas relacionadas al asiento
    await db.delete(journalLines).where(eq(journalLines.journalEntryId, id));
    // Luego eliminamos el asiento
    const result = await db.delete(journalEntries).where(eq(journalEntries.id, id));
    return !!result;
  }
}

// Implementation using in-memory storage
export class MemStorage implements IStorage {
  sessionStore: session.Store;
  private usersData: Map<number, User>;
  private clientsData: Map<number, Client>;
  private quotesData: Map<number, Quote>;
  private quoteItemsData: Map<number, QuoteItem[]>;
  private invoicesData: Map<number, Invoice>;
  private invoiceItemsData: Map<number, InvoiceItem[]>;
  private expensesData: Map<number, Expense>;
  private accountsData: Map<number, Account>;
  private journalEntriesData: Map<number, JournalEntry>;
  private journalLinesData: Map<number, JournalLine[]>;
  
  private currentUserId: number;
  private currentClientId: number;
  private currentQuoteId: number;
  private currentQuoteItemId: number;
  private currentInvoiceId: number;
  private currentInvoiceItemId: number;
  private currentExpenseId: number;
  private currentAccountId: number;
  private currentJournalEntryId: number;
  private currentJournalLineId: number;

  constructor() {
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Limpiar sesiones expiradas cada 24 horas
    });

    this.usersData = new Map();
    this.clientsData = new Map();
    this.quotesData = new Map();
    this.quoteItemsData = new Map();
    this.invoicesData = new Map();
    this.invoiceItemsData = new Map();
    this.expensesData = new Map();
    this.accountsData = new Map();
    this.journalEntriesData = new Map();
    this.journalLinesData = new Map();
    
    this.currentUserId = 1;
    this.currentClientId = 1;
    this.currentQuoteId = 1;
    this.currentQuoteItemId = 1;
    this.currentInvoiceId = 1;
    this.currentInvoiceItemId = 1;
    this.currentExpenseId = 1;
    this.currentAccountId = 1;
    this.currentJournalEntryId = 1;
    this.currentJournalLineId = 1;
    
    // Add some sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Add some initial accounts (chart of accounts)
    const accounts = [
      { code: "1000", name: "Caja y Bancos", type: "asset" as const, description: "Efectivo y cuentas bancarias" },
      { code: "1100", name: "Cuentas por Cobrar", type: "asset" as const, description: "Facturas pendientes de cobro" },
      { code: "2000", name: "Cuentas por Pagar", type: "liability" as const, description: "Facturas pendientes de pago" },
      { code: "3000", name: "Capital", type: "equity" as const, description: "Capital del propietario" },
      { code: "4000", name: "Ingresos", type: "revenue" as const, description: "Ingresos por ventas" },
      { code: "5000", name: "Gastos Operativos", type: "expense" as const, description: "Gastos generales de operación" },
    ];
    
    accounts.forEach(account => {
      this.createAccount({
        code: account.code,
        name: account.name,
        type: account.type,
        description: account.description,
        isActive: true
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByClerkId(clerkId: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.clerkId === clerkId
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now, 
      updatedAt: now,
      fullName: insertUser.fullName ?? null,
      role: insertUser.role ?? 'user',
      clerkId: insertUser.clerkId ?? null
    };
    this.usersData.set(id, user);
    return user;
  }
  
  // Client methods
  async getClients(): Promise<Client[]> {
    return Array.from(this.clientsData.values());
  }
  
  async getClient(id: number): Promise<Client | undefined> {
    return this.clientsData.get(id);
  }
  
  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const now = new Date();
    const client: Client = {
      ...insertClient,
      id,
      createdAt: now,
      updatedAt: now,
      clientType: insertClient.clientType || "company",
      companyName: insertClient.companyName ?? null,
      displayName: insertClient.displayName ?? null,
      salutation: insertClient.salutation ?? null,
      firstName: insertClient.firstName ?? null,
      lastName: insertClient.lastName ?? null,
      email: insertClient.email ?? null,
      workPhone: insertClient.workPhone ?? null,
      mobilePhone: insertClient.mobilePhone ?? null,
      address: insertClient.address ?? null,
      city: insertClient.city ?? null,
      state: insertClient.state ?? null,
      postalCode: insertClient.postalCode ?? null,
      country: insertClient.country ?? null,
      taxId: insertClient.taxId ?? null,
      paymentTerms: insertClient.paymentTerms || "30_days",
      customPaymentTerms: insertClient.customPaymentTerms ?? null,
      hasPortalAccess: insertClient.hasPortalAccess ?? false,
      notes: insertClient.notes ?? null,
      isActive: insertClient.isActive ?? true
    };
    this.clientsData.set(id, client);
    return client;
  }
  
  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clientsData.get(id);
    if (!existingClient) return undefined;
    
    const updatedClient: Client = {
      ...existingClient,
      ...clientData,
      updatedAt: new Date()
    };
    
    this.clientsData.set(id, updatedClient);
    return updatedClient;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    return this.clientsData.delete(id);
  }
  
  async searchClients(query: string): Promise<Client[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.clientsData.values()).filter(
      client => 
        (client.companyName && client.companyName.toLowerCase().includes(lowercaseQuery)) ||
        (client.displayName && client.displayName.toLowerCase().includes(lowercaseQuery)) ||
        (client.firstName && client.firstName.toLowerCase().includes(lowercaseQuery)) ||
        (client.lastName && client.lastName.toLowerCase().includes(lowercaseQuery)) ||
        (client.email && client.email.toLowerCase().includes(lowercaseQuery))
    );
  }
  
  // Quote methods
  async getQuotes(): Promise<Quote[]> {
    return Array.from(this.quotesData.values());
  }
  
  async getQuotesByClient(clientId: number): Promise<Quote[]> {
    return Array.from(this.quotesData.values()).filter(
      quote => quote.clientId === clientId
    );
  }
  
  async getQuote(id: number): Promise<Quote | undefined> {
    return this.quotesData.get(id);
  }
  
  async getQuoteWithItems(id: number): Promise<{quote: Quote, items: QuoteItem[]} | undefined> {
    const quote = this.quotesData.get(id);
    if (!quote) return undefined;
    
    const items = this.quoteItemsData.get(id) || [];
    return { quote, items };
  }
  
  async createQuote(insertQuote: InsertQuote, items: InsertQuoteItem[]): Promise<Quote> {
    const id = this.currentQuoteId++;
    const now = new Date();
    
    // Asegurarse de que las fechas sean objetos Date
    const issueDate = insertQuote.issueDate instanceof Date ? 
      insertQuote.issueDate : 
      (typeof insertQuote.issueDate === 'string' ? new Date(insertQuote.issueDate) : now);
      
    const expiryDate = insertQuote.expiryDate instanceof Date ? 
      insertQuote.expiryDate : 
      (typeof insertQuote.expiryDate === 'string' ? new Date(insertQuote.expiryDate) : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
    
    const quote: Quote = {
      id,
      quoteNumber: insertQuote.quoteNumber,
      clientId: insertQuote.clientId,
      issueDate,
      expiryDate,
      status: insertQuote.status || "draft",
      subtotal: insertQuote.subtotal,
      taxAmount: insertQuote.taxAmount || null,
      total: insertQuote.total,
      convertedToInvoiceId: insertQuote.convertedToInvoiceId || null,
      notes: insertQuote.notes || null,
      termsAndConditions: insertQuote.termsAndConditions || null,
      createdAt: now,
      updatedAt: now
    };
    
    this.quotesData.set(id, quote);
    
    // Create quote items
    const quoteItems: QuoteItem[] = items.map(item => ({
      ...item,
      id: this.currentQuoteItemId++,
      quoteId: id,
      taxRate: item.taxRate || null
    }));
    
    this.quoteItemsData.set(id, quoteItems);
    
    return quote;
  }
  
  async updateQuote(id: number, quoteData: Partial<InsertQuote>): Promise<Quote | undefined> {
    const existingQuote = this.quotesData.get(id);
    if (!existingQuote) return undefined;
    
    const updatedQuote: Quote = {
      ...existingQuote,
      ...quoteData,
      updatedAt: new Date()
    };
    
    this.quotesData.set(id, updatedQuote);
    return updatedQuote;
  }
  
  async updateQuoteStatus(id: number, status: QuoteStatus): Promise<Quote | undefined> {
    const existingQuote = this.quotesData.get(id);
    if (!existingQuote) return undefined;
    
    const updatedQuote: Quote = {
      ...existingQuote,
      status,
      updatedAt: new Date()
    };
    
    this.quotesData.set(id, updatedQuote);
    return updatedQuote;
  }
  
  async deleteQuote(id: number): Promise<boolean> {
    this.quoteItemsData.delete(id);
    return this.quotesData.delete(id);
  }
  
  async convertQuoteToInvoice(quoteId: number): Promise<Invoice | undefined> {
    const quoteWithItems = await this.getQuoteWithItems(quoteId);
    if (!quoteWithItems) return undefined;
    
    const { quote, items } = quoteWithItems;
    
    // Actualizamos el estado de la cotización
    await this.updateQuoteStatus(quoteId, "converted");
    
    // Creamos la factura
    const invoiceData: InsertInvoice = {
      clientId: quote.clientId,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      issueDate: new Date(),
      dueDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), // 30 días de plazo por defecto
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      total: quote.total,
      notes: `Generado desde cotización #${quote.quoteNumber}`,
      status: "draft"
    };
    
    // Creamos la factura con sus items
    const newInvoice = await this.createInvoice(invoiceData, items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      amount: item.amount,
      taxRate: item.taxRate as any,
      invoiceId: 0 // Este valor será reemplazado por el ID real en createInvoice
    })));
    
    // Actualizamos la cotización para incluir el ID de la factura asociada
    await this.updateQuote(quoteId, {
      convertedToInvoiceId: newInvoice.id
    });
    
    return newInvoice;
  }
  
  // Invoice methods
  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoicesData.values());
  }
  
  async getInvoicesByClient(clientId: number): Promise<Invoice[]> {
    return Array.from(this.invoicesData.values()).filter(
      invoice => invoice.clientId === clientId
    );
  }
  
  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoicesData.get(id);
  }
  
  async updateInvoiceStatus(id: number, status: InvoiceStatus): Promise<Invoice | undefined> {
    const existingInvoice = this.invoicesData.get(id);
    if (!existingInvoice) return undefined;
    
    const updatedInvoice: Invoice = {
      ...existingInvoice,
      status,
      updatedAt: new Date()
    };
    
    this.invoicesData.set(id, updatedInvoice);
    return updatedInvoice;
  }
  
  async getInvoiceWithItems(id: number): Promise<{invoice: Invoice, items: InvoiceItem[]} | undefined> {
    const invoice = this.invoicesData.get(id);
    if (!invoice) return undefined;
    
    const items = this.invoiceItemsData.get(id) || [];
    return { invoice, items };
  }
  
  async createInvoice(insertInvoice: InsertInvoice, items: InsertInvoiceItem[]): Promise<Invoice> {
    const id = this.currentInvoiceId++;
    const now = new Date();
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      createdAt: now,
      updatedAt: now,
      status: insertInvoice.status || "draft",
      issueDate: insertInvoice.issueDate || now,
      dueDate: insertInvoice.dueDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      notes: insertInvoice.notes || null,
      taxAmount: insertInvoice.taxAmount || null
    };
    
    this.invoicesData.set(id, invoice);
    
    // Create invoice items
    const invoiceItems: InvoiceItem[] = items.map(item => ({
      ...item,
      id: this.currentInvoiceItemId++,
      invoiceId: id,
      taxRate: item.taxRate || null
    }));
    
    this.invoiceItemsData.set(id, invoiceItems);
    
    return invoice;
  }
  
  async updateInvoice(id: number, invoiceData: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const existingInvoice = this.invoicesData.get(id);
    if (!existingInvoice) return undefined;
    
    const updatedInvoice: Invoice = {
      ...existingInvoice,
      ...invoiceData,
      updatedAt: new Date()
    };
    
    this.invoicesData.set(id, updatedInvoice);
    return updatedInvoice;
  }
  
  async deleteInvoice(id: number): Promise<boolean> {
    this.invoiceItemsData.delete(id);
    return this.invoicesData.delete(id);
  }
  
  // Expense methods
  async getExpenses(): Promise<Expense[]> {
    return Array.from(this.expensesData.values());
  }
  
  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expensesData.get(id);
  }
  
  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = this.currentExpenseId++;
    const now = new Date();
    const expense: Expense = {
      ...insertExpense,
      id,
      createdAt: now,
      updatedAt: now,
      date: insertExpense.date || now,
      notes: insertExpense.notes || null,
      category: insertExpense.category || "other",
      receipt: insertExpense.receipt || null
    };
    
    this.expensesData.set(id, expense);
    return expense;
  }
  
  async updateExpense(id: number, expenseData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const existingExpense = this.expensesData.get(id);
    if (!existingExpense) return undefined;
    
    const updatedExpense: Expense = {
      ...existingExpense,
      ...expenseData,
      updatedAt: new Date()
    };
    
    this.expensesData.set(id, updatedExpense);
    return updatedExpense;
  }
  
  async deleteExpense(id: number): Promise<boolean> {
    return this.expensesData.delete(id);
  }
  
  // Chart of Accounts methods
  async getAccounts(): Promise<Account[]> {
    return Array.from(this.accountsData.values());
  }
  
  async getAccount(id: number): Promise<Account | undefined> {
    return this.accountsData.get(id);
  }
  
  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = this.currentAccountId++;
    const now = new Date();
    const account: Account = {
      ...insertAccount,
      id,
      createdAt: now,
      updatedAt: now,
      isActive: insertAccount.isActive ?? true,
      description: insertAccount.description ?? null,
      parentId: insertAccount.parentId ?? null
    };
    
    this.accountsData.set(id, account);
    return account;
  }
  
  async updateAccount(id: number, accountData: Partial<InsertAccount>): Promise<Account | undefined> {
    const existingAccount = this.accountsData.get(id);
    if (!existingAccount) return undefined;
    
    const updatedAccount: Account = {
      ...existingAccount,
      ...accountData,
      updatedAt: new Date()
    };
    
    this.accountsData.set(id, updatedAccount);
    return updatedAccount;
  }
  
  async deleteAccount(id: number): Promise<boolean> {
    return this.accountsData.delete(id);
  }
  
  // Journal Entry methods
  async getJournalEntries(): Promise<JournalEntry[]> {
    return Array.from(this.journalEntriesData.values());
  }
  
  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntriesData.get(id);
  }
  
  async getJournalEntryWithLines(id: number): Promise<{entry: JournalEntry, lines: JournalLine[]} | undefined> {
    const entry = this.journalEntriesData.get(id);
    if (!entry) return undefined;
    
    const lines = this.journalLinesData.get(id) || [];
    return { entry, lines };
  }
  
  async createJournalEntry(insertEntry: InsertJournalEntry, lines: InsertJournalLine[]): Promise<JournalEntry> {
    const id = this.currentJournalEntryId++;
    const now = new Date();
    const entry: JournalEntry = {
      ...insertEntry,
      id,
      createdAt: now,
      updatedAt: now,
      date: insertEntry.date || now,
      reference: insertEntry.reference || null,
      sourceType: insertEntry.sourceType || null,
      sourceId: insertEntry.sourceId || null
    };
    
    this.journalEntriesData.set(id, entry);
    
    // Create journal lines with proper type enforcement
    const journalLines: JournalLine[] = lines.map(line => {
      // Ensure debit and credit are never undefined
      const debitValue: string = line.debit || "0";
      const creditValue: string = line.credit || "0";
      
      return {
        id: this.currentJournalLineId++,
        journalEntryId: id,
        accountId: line.accountId,
        description: line.description || null,
        debit: debitValue,
        credit: creditValue,
      };
    });
    
    this.journalLinesData.set(id, journalLines);
    
    return entry;
  }
  
  async updateJournalEntry(id: number, entryData: Partial<InsertJournalEntry>): Promise<JournalEntry | undefined> {
    const existingEntry = this.journalEntriesData.get(id);
    if (!existingEntry) return undefined;
    
    const updatedEntry: JournalEntry = {
      ...existingEntry,
      ...entryData,
      updatedAt: new Date()
    };
    
    this.journalEntriesData.set(id, updatedEntry);
    return updatedEntry;
  }
  
  async deleteJournalEntry(id: number): Promise<boolean> {
    this.journalLinesData.delete(id);
    return this.journalEntriesData.delete(id);
  }
}

// Cambiamos de MemStorage a DatabaseStorage
export const storage = new DatabaseStorage();