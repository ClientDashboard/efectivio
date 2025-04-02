import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertInvoiceSchema, 
  insertInvoiceItemSchema,
  insertExpenseSchema,
  insertAccountSchema,
  insertJournalEntrySchema,
  insertJournalLineSchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Helper function to handle validation errors
  const validateRequest = (schema: any, data: any) => {
    try {
      return { success: true, data: schema.parse(data) };
    } catch (error) {
      if (error instanceof ZodError) {
        return { 
          success: false, 
          error: error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message
          }))
        };
      }
      return { success: false, error: "Unknown validation error" };
    }
  };

  // Clients API
  app.get("/api/clients", async (req: Request, res: Response) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Error fetching clients", error });
    }
  });

  app.get("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Error fetching client", error });
    }
  });

  app.post("/api/clients", async (req: Request, res: Response) => {
    try {
      const validation = validateRequest(insertClientSchema, req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Validation error", errors: validation.error });
      }
      
      const client = await storage.createClient(validation.data);
      res.status(201).json(client);
    } catch (error) {
      res.status(500).json({ message: "Error creating client", error });
    }
  });

  app.put("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validation = validateRequest(insertClientSchema.partial(), req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Validation error", errors: validation.error });
      }
      
      const updatedClient = await storage.updateClient(id, validation.data);
      
      if (!updatedClient) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(updatedClient);
    } catch (error) {
      res.status(500).json({ message: "Error updating client", error });
    }
  });

  app.delete("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteClient(id);
      
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting client", error });
    }
  });

  // Invoices API
  app.get("/api/invoices", async (req: Request, res: Response) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Error fetching invoices", error });
    }
  });

  app.get("/api/invoices/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const invoiceData = await storage.getInvoiceWithItems(id);
      
      if (!invoiceData) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(invoiceData);
    } catch (error) {
      res.status(500).json({ message: "Error fetching invoice", error });
    }
  });

  app.post("/api/invoices", async (req: Request, res: Response) => {
    try {
      const { invoice, items } = req.body;
      
      const invoiceValidation = validateRequest(insertInvoiceSchema, invoice);
      if (!invoiceValidation.success) {
        return res.status(400).json({ message: "Invoice validation error", errors: invoiceValidation.error });
      }
      
      // Validate each item
      const itemsValidation = items.map((item: any) => validateRequest(insertInvoiceItemSchema, item));
      const hasItemErrors = itemsValidation.some(v => !v.success);
      
      if (hasItemErrors) {
        const errors = itemsValidation
          .filter((v: any) => !v.success)
          .map((v: any, index: number) => ({ index, errors: v.error }));
          
        return res.status(400).json({ message: "Item validation error", errors });
      }
      
      const validatedItems = itemsValidation.map((v: any) => v.data);
      
      // Create invoice with items
      const createdInvoice = await storage.createInvoice(invoiceValidation.data, validatedItems);
      
      // Create journal entry for this invoice
      await createJournalEntryFromInvoice(createdInvoice.id);
      
      res.status(201).json(createdInvoice);
    } catch (error) {
      res.status(500).json({ message: "Error creating invoice", error });
    }
  });

  // Create a journal entry from an invoice
  async function createJournalEntryFromInvoice(invoiceId: number) {
    try {
      const invoiceData = await storage.getInvoiceWithItems(invoiceId);
      if (!invoiceData) return;
      
      const { invoice } = invoiceData;
      
      // Create journal entry
      const journalEntry = await storage.createJournalEntry(
        {
          date: invoice.issueDate,
          reference: `Invoice #${invoice.invoiceNumber}`,
          description: `Invoice created for client #${invoice.clientId}`,
          sourceType: 'invoice',
          sourceId: invoice.id
        },
        [
          // Debit accounts receivable
          {
            accountId: 2, // Accounts Receivable (ID from sample data)
            description: `Invoice #${invoice.invoiceNumber}`,
            debit: invoice.total.toString(),
            credit: "0"
          },
          // Credit revenue
          {
            accountId: 5, // Revenue account (ID from sample data)
            description: `Invoice #${invoice.invoiceNumber}`,
            debit: "0",
            credit: invoice.total.toString()
          }
        ]
      );
      
      return journalEntry;
      
    } catch (error) {
      console.error("Error creating journal entry from invoice:", error);
    }
  }

  app.put("/api/invoices/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validation = validateRequest(insertInvoiceSchema.partial(), req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Validation error", errors: validation.error });
      }
      
      const updatedInvoice = await storage.updateInvoice(id, validation.data);
      
      if (!updatedInvoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(updatedInvoice);
    } catch (error) {
      res.status(500).json({ message: "Error updating invoice", error });
    }
  });

  app.delete("/api/invoices/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteInvoice(id);
      
      if (!success) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting invoice", error });
    }
  });

  // Expenses API
  app.get("/api/expenses", async (req: Request, res: Response) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Error fetching expenses", error });
    }
  });

  app.get("/api/expenses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const expense = await storage.getExpense(id);
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Error fetching expense", error });
    }
  });

  app.post("/api/expenses", async (req: Request, res: Response) => {
    try {
      const validation = validateRequest(insertExpenseSchema, req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Validation error", errors: validation.error });
      }
      
      const expense = await storage.createExpense(validation.data);
      
      // Create journal entry for this expense
      await createJournalEntryFromExpense(expense.id);
      
      res.status(201).json(expense);
    } catch (error) {
      res.status(500).json({ message: "Error creating expense", error });
    }
  });

  // Create a journal entry from an expense
  async function createJournalEntryFromExpense(expenseId: number) {
    try {
      const expense = await storage.getExpense(expenseId);
      if (!expense) return;
      
      // Create journal entry
      const journalEntry = await storage.createJournalEntry(
        {
          date: expense.date,
          reference: `Expense #${expense.id}`,
          description: `Expense: ${expense.description}`,
          sourceType: 'expense',
          sourceId: expense.id
        },
        [
          // Debit expense account
          {
            accountId: 6, // Expense account (ID from sample data)
            description: expense.description,
            debit: expense.amount.toString(),
            credit: "0"
          },
          // Credit cash
          {
            accountId: 1, // Cash and Banks (ID from sample data)
            description: expense.description,
            debit: "0",
            credit: expense.amount.toString()
          }
        ]
      );
      
      return journalEntry;
      
    } catch (error) {
      console.error("Error creating journal entry from expense:", error);
    }
  }

  app.put("/api/expenses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validation = validateRequest(insertExpenseSchema.partial(), req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Validation error", errors: validation.error });
      }
      
      const updatedExpense = await storage.updateExpense(id, validation.data);
      
      if (!updatedExpense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(updatedExpense);
    } catch (error) {
      res.status(500).json({ message: "Error updating expense", error });
    }
  });

  app.delete("/api/expenses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteExpense(id);
      
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting expense", error });
    }
  });

  // Chart of Accounts API
  app.get("/api/accounts", async (req: Request, res: Response) => {
    try {
      const accounts = await storage.getAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching accounts", error });
    }
  });

  app.get("/api/accounts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const account = await storage.getAccount(id);
      
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Error fetching account", error });
    }
  });

  app.post("/api/accounts", async (req: Request, res: Response) => {
    try {
      const validation = validateRequest(insertAccountSchema, req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Validation error", errors: validation.error });
      }
      
      const account = await storage.createAccount(validation.data);
      res.status(201).json(account);
    } catch (error) {
      res.status(500).json({ message: "Error creating account", error });
    }
  });

  app.put("/api/accounts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validation = validateRequest(insertAccountSchema.partial(), req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Validation error", errors: validation.error });
      }
      
      const updatedAccount = await storage.updateAccount(id, validation.data);
      
      if (!updatedAccount) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      res.json(updatedAccount);
    } catch (error) {
      res.status(500).json({ message: "Error updating account", error });
    }
  });

  app.delete("/api/accounts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteAccount(id);
      
      if (!success) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting account", error });
    }
  });

  // Journal Entries API
  app.get("/api/journal-entries", async (req: Request, res: Response) => {
    try {
      const entries = await storage.getJournalEntries();
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Error fetching journal entries", error });
    }
  });

  app.get("/api/journal-entries/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const entryData = await storage.getJournalEntryWithLines(id);
      
      if (!entryData) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      res.json(entryData);
    } catch (error) {
      res.status(500).json({ message: "Error fetching journal entry", error });
    }
  });

  app.post("/api/journal-entries", async (req: Request, res: Response) => {
    try {
      const { entry, lines } = req.body;
      
      const entryValidation = validateRequest(insertJournalEntrySchema, entry);
      if (!entryValidation.success) {
        return res.status(400).json({ message: "Journal entry validation error", errors: entryValidation.error });
      }
      
      // Validate each line
      const linesValidation = lines.map((line: any) => validateRequest(insertJournalLineSchema, line));
      const hasLineErrors = linesValidation.some(v => !v.success);
      
      if (hasLineErrors) {
        const errors = linesValidation
          .filter((v: any) => !v.success)
          .map((v: any, index: number) => ({ index, errors: v.error }));
          
        return res.status(400).json({ message: "Line validation error", errors });
      }
      
      const validatedLines = linesValidation.map((v: any) => v.data);
      
      // Validate that debits = credits
      const totalDebit = validatedLines.reduce((sum: number, line: any) => 
        sum + parseFloat(line.debit), 0);
      const totalCredit = validatedLines.reduce((sum: number, line: any) => 
        sum + parseFloat(line.credit), 0);
        
      // Using a small epsilon for floating point comparison
      if (Math.abs(totalDebit - totalCredit) > 0.001) {
        return res.status(400).json({ 
          message: "Journal entry is not balanced", 
          totalDebit, 
          totalCredit 
        });
      }
      
      // Create journal entry with lines
      const createdEntry = await storage.createJournalEntry(entryValidation.data, validatedLines);
      
      res.status(201).json(createdEntry);
    } catch (error) {
      res.status(500).json({ message: "Error creating journal entry", error });
    }
  });

  app.delete("/api/journal-entries/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteJournalEntry(id);
      
      if (!success) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting journal entry", error });
    }
  });

  // Balance Sheet API
  app.get("/api/reports/balance-sheet", async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would aggregate account balances from journal entries
      // For now, returning a mock structure
      const accounts = await storage.getAccounts();
      
      const assets = accounts.filter(account => account.type === 'asset');
      const liabilities = accounts.filter(account => account.type === 'liability');
      const equity = accounts.filter(account => account.type === 'equity');
      
      res.json({
        asOfDate: new Date(),
        assets: assets.map(a => ({ ...a, balance: Math.random() * 10000 })),
        liabilities: liabilities.map(a => ({ ...a, balance: Math.random() * 5000 })),
        equity: equity.map(a => ({ ...a, balance: Math.random() * 5000 }))
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating balance sheet", error });
    }
  });

  // Income Statement API
  app.get("/api/reports/income-statement", async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would aggregate revenue and expense accounts from journal entries
      const accounts = await storage.getAccounts();
      
      const revenue = accounts.filter(account => account.type === 'revenue');
      const expenses = accounts.filter(account => account.type === 'expense');
      
      res.json({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date(),
        revenue: revenue.map(a => ({ ...a, balance: Math.random() * 10000 })),
        expenses: expenses.map(a => ({ ...a, balance: Math.random() * 8000 }))
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating income statement", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
