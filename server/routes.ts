import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { HfInference } from '@huggingface/inference';
import { 
  insertClientSchema, 
  insertInvoiceSchema, 
  insertInvoiceItemSchema,
  insertExpenseSchema,
  insertAccountSchema,
  insertJournalEntrySchema,
  insertJournalLineSchema,
  insertUserSchema,
  insertFileSchema,
  insertClientInvitationSchema,
  insertClientPortalUserSchema,
  insertProjectSchema,
  insertTaskSchema,
  insertTimeEntrySchema,
  insertAppointmentSchema,
  insertMeetingSchema,
  insertTranscriptionSegmentSchema,
  insertMeetingIntegrationSchema,
  MeetingProvider,
  FileCategory,
  transcriptionSegments,
} from "@shared/schema";
import { ZodError } from "zod";
import { supabaseAdmin, uploadFile, deleteFile, getSignedUrl, createFilePath, STORAGE_BUCKETS } from "./supabase";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { 
  createMeeting,
  generateMeetingLink,
  uploadMeetingRecording,
  processMeetingData,
  getMeetingDetails,
  initializeMeetingStorageBucket
} from "./meetings";
import {
  transcribeAudio,
  generateMeetingSummary,
  extractKeyPointsAndActions
} from "./ai";

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
      const hasItemErrors = itemsValidation.some((v: any) => !v.success);
      
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
            journalEntryId: 0, // Será asignado por el sistema
            accountId: 2, // Accounts Receivable (ID from sample data)
            description: `Invoice #${invoice.invoiceNumber}`,
            debit: invoice.total.toString(),
            credit: "0"
          },
          // Credit revenue
          {
            journalEntryId: 0, // Será asignado por el sistema
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
            journalEntryId: 0, // Será asignado por el sistema
            accountId: 6, // Expense account (ID from sample data)
            description: expense.description,
            debit: expense.amount.toString(),
            credit: "0"
          },
          // Credit cash
          {
            journalEntryId: 0, // Será asignado por el sistema
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
      const hasLineErrors = linesValidation.some((v: any) => !v.success);
      
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

  // Authentication API endpoints
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      // Validar los datos de entrada
      const validation = validateRequest(insertUserSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Error de validación", 
          errors: validation.error 
        });
      }

      const { username, email, password, fullName } = validation.data;

      // Verificar si el usuario ya existe en la base de datos
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
      }

      // Registrar usuario en Supabase
      const { data: supabaseUser, error: supabaseError } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName
          }
        }
      });

      if (supabaseError) {
        console.error("Error al registrar usuario en Supabase:", supabaseError);
        return res.status(500).json({ 
          message: "Error al registrar usuario", 
          error: supabaseError.message 
        });
      }

      // No necesitamos crear el usuario en nuestra base de datos
      // ya que Supabase maneja esto automáticamente con el trigger
      // que hemos definido en el script SQL
      const user = {
        id: supabaseUser.user?.id,
        username,
        email,
        fullName,
        role: 'user'
      };

      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      res.status(500).json({ message: "Error al registrar usuario", error });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Autenticar con Supabase
      const { data: sessionData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        return res.status(401).json({ message: "Credenciales inválidas", error: authError.message });
      }

      // Obtener el perfil del usuario desde Supabase
      const supabaseUser = sessionData.session?.user;
      
      // Consultar la tabla de perfiles para obtener información adicional
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser?.id)
        .single();
      
      if (profileError) {
        return res.status(404).json({ message: "Perfil de usuario no encontrado", error: profileError.message });
      }
      
      res.json({
        id: supabaseUser?.id,
        username: profileData.username || supabaseUser?.email,
        email: supabaseUser?.email,
        fullName: profileData.full_name,
        role: profileData.role,
        token: sessionData.session?.access_token
      });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      res.status(500).json({ message: "Error al iniciar sesión", error });
    }
  });

  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const { error } = await supabaseAdmin.auth.signOut();
      
      if (error) {
        return res.status(500).json({ message: "Error al cerrar sesión", error: error.message });
      }
      
      res.status(200).json({ message: "Sesión cerrada correctamente" });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      res.status(500).json({ message: "Error al cerrar sesión", error });
    }
  });

  app.get("/api/auth/user", async (req: Request, res: Response) => {
    try {
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        return res.status(401).json({ message: "No autenticado" });
      }
      
      const supabaseUser = sessionData.session.user;
      
      // Consultar la tabla de perfiles para obtener información adicional
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      if (profileError) {
        return res.status(404).json({ message: "Perfil de usuario no encontrado", error: profileError.message });
      }
      
      res.json({
        id: supabaseUser.id,
        username: profileData.username || supabaseUser.email,
        email: supabaseUser.email,
        fullName: profileData.full_name,
        role: profileData.role
      });
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      res.status(500).json({ message: "Error al obtener usuario", error });
    }
  });

  // Configurar Multer para manejar subida de archivos
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB límite
    },
  });

  // Middleware para verificar autenticación
  const requireAuth = async (req: Request, res: Response, next: Function) => {
    try {
      if (!req.headers.authorization) {
        return res.status(401).json({ message: "No authorization token provided" });
      }
      
      const jwt = req.headers.authorization.split(" ")[1];
      const { data, error } = await supabaseAdmin.auth.getUser(jwt);
      
      if (error || !data.user) {
        return res.status(401).json({ message: "Invalid token", error });
      }
      
      // Añadir el usuario a la request
      (req as any).user = data.user;
      next();
    } catch (error) {
      res.status(500).json({ message: "Error authenticating user", error });
    }
  };

  // ===== API PARA GESTIÓN DE ARCHIVOS =====

  // Subir un archivo
  app.post("/api/files/upload", requireAuth, upload.single("file"), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const { bucket, clientId, category, path } = req.body;
      
      if (!file) {
        return res.status(400).json({ message: "No file provided" });
      }
      
      // Verificar que el bucket es válido
      if (!Object.values(STORAGE_BUCKETS).includes(bucket)) {
        return res.status(400).json({ message: "Invalid bucket name" });
      }
      
      // Verificar que la categoría es válida
      // Aquí habría que añadir una validación más precisa
      
      // Crear una ruta de archivo apropiada
      const userId = (req as any).user.id;
      const filePath = createFilePath(
        userId,
        clientId ? parseInt(clientId) : null, 
        category || 'general', 
        file.originalname
      );
      
      const result = await uploadFile(
        bucket,
        filePath,
        file.buffer,
        file.mimetype
      );
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: "Error uploading file", error });
    }
  });

  // Obtener archivos de un cliente
  app.get("/api/files/client/:clientId", requireAuth, async (req: Request, res: Response) => {
    try {
      const clientId = parseInt(req.params.clientId);
      
      const { data, error } = await supabaseAdmin
        .from('files')
        .select('*')
        .eq('client_id', clientId);
        
      if (error) {
        return res.status(500).json({ message: "Error fetching files", error });
      }
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Error fetching files", error });
    }
  });

  // Obtener archivos por categoría
  app.get("/api/files/category/:category", requireAuth, async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      
      const { data, error } = await supabaseAdmin
        .from('files')
        .select('*')
        .eq('category', category);
        
      if (error) {
        return res.status(500).json({ message: "Error fetching files", error });
      }
      
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Error fetching files", error });
    }
  });

  // Descargar un archivo
  app.get("/api/files/:id/download", requireAuth, async (req: Request, res: Response) => {
    try {
      const fileId = req.params.id;
      
      // Obtener información del archivo
      const { data: file, error } = await supabaseAdmin
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();
        
      if (error || !file) {
        return res.status(404).json({ message: "File not found", error });
      }
      
      // Determinar el bucket
      let bucket = STORAGE_BUCKETS.DOCUMENTS;
      switch (file.category) {
        case 'invoice':
          bucket = STORAGE_BUCKETS.INVOICES;
          break;
        case 'receipt':
          bucket = STORAGE_BUCKETS.RECEIPTS;
          break;
        case 'contract':
          bucket = STORAGE_BUCKETS.CONTRACTS;
          break;
        default:
          bucket = STORAGE_BUCKETS.DOCUMENTS;
      }
      
      // Generar URL firmada
      const { data: urlData, error: urlError } = await supabaseAdmin
        .storage
        .from(bucket)
        .createSignedUrl(file.path, 60 * 10); // 10 minutos
        
      if (urlError) {
        return res.status(500).json({ message: "Error generating download URL", error: urlError });
      }
      
      res.json({ downloadUrl: urlData.signedUrl });
    } catch (error) {
      res.status(500).json({ message: "Error downloading file", error });
    }
  });

  // Eliminar un archivo
  app.delete("/api/files/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const fileId = req.params.id;
      
      // Obtener información del archivo
      const { data: file, error } = await supabaseAdmin
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();
        
      if (error || !file) {
        return res.status(404).json({ message: "File not found", error });
      }
      
      // Verificar que el usuario tiene permisos
      if (file.user_id !== (req as any).user.id) {
        return res.status(403).json({ message: "Permission denied" });
      }
      
      // Determinar el bucket
      let bucket = STORAGE_BUCKETS.DOCUMENTS;
      switch (file.category) {
        case 'invoice':
          bucket = STORAGE_BUCKETS.INVOICES;
          break;
        case 'receipt':
          bucket = STORAGE_BUCKETS.RECEIPTS;
          break;
        case 'contract':
          bucket = STORAGE_BUCKETS.CONTRACTS;
          break;
        default:
          bucket = STORAGE_BUCKETS.DOCUMENTS;
      }
      
      // Eliminar el archivo
      await deleteFile(bucket, file.path);
      
      // Eliminar el registro de la base de datos
      await supabaseAdmin
        .from('files')
        .delete()
        .eq('id', fileId);
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting file", error });
    }
  });

  // ===== API PARA PORTAL DE CLIENTES =====

  // Generar invitación para cliente
  app.post("/api/client-portal/invitations", requireAuth, async (req: Request, res: Response) => {
    try {
      const { clientId, email } = req.body;
      
      if (!clientId || !email) {
        return res.status(400).json({ message: "Client ID and email are required" });
      }
      
      // Generar token único
      const token = `inv_${randomUUID().replace(/-/g, '')}`;
      
      // Calcular fecha de expiración (7 días)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Guardar invitación
      const { data, error } = await supabaseAdmin
        .from('client_invitations')
        .insert({
          client_id: clientId,
          email,
          token,
          expires_at: expiresAt.toISOString(),
          user_id: (req as any).user.id
        })
        .select()
        .single();
        
      if (error) {
        return res.status(500).json({ message: "Error creating invitation", error });
      }
      
      // Aquí se podría enviar un email al cliente usando algún servicio de email
      
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ message: "Error creating invitation", error });
    }
  });

  // Validar invitación para cliente
  app.get("/api/client-portal/invitations/:token/validate", async (req: Request, res: Response) => {
    try {
      const token = req.params.token;
      
      const { data, error } = await supabaseAdmin
        .from('client_invitations')
        .select('*, clients(*)')
        .eq('token', token)
        .single();
        
      if (error || !data) {
        return res.status(404).json({ message: "Invitation not found", error });
      }
      
      // Verificar si la invitación ha expirado
      if (new Date(data.expires_at) < new Date()) {
        return res.status(400).json({ message: "Invitation has expired" });
      }
      
      res.json({
        invitation: data,
        client: data.clients,
        isValid: true
      });
    } catch (error) {
      res.status(500).json({ message: "Error validating invitation", error });
    }
  });

  // Registrar cliente usando invitación
  app.post("/api/client-portal/register", async (req: Request, res: Response) => {
    try {
      const { token, email, password, fullName } = req.body;
      
      if (!token || !email || !password || !fullName) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      // Verificar la invitación
      const { data: invitation, error: invError } = await supabaseAdmin
        .from('client_invitations')
        .select('*, clients(*)')
        .eq('token', token)
        .single();
        
      if (invError || !invitation) {
        return res.status(404).json({ message: "Invitation not found", error: invError });
      }
      
      // Verificar si la invitación ha expirado
      if (new Date(invitation.expires_at) < new Date()) {
        return res.status(400).json({ message: "Invitation has expired" });
      }
      
      // Verificar que el email coincide con el de la invitación
      if (invitation.email !== email) {
        return res.status(400).json({ message: "Email does not match invitation" });
      }
      
      // Registrar al usuario en Supabase
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role: 'client',
          client_id: invitation.client_id
        }
      });
      
      if (error) {
        return res.status(500).json({ message: "Error creating user", error });
      }
      
      // Eliminar la invitación ya que ha sido utilizada
      await supabaseAdmin
        .from('client_invitations')
        .delete()
        .eq('token', token);
      
      res.status(201).json({
        message: "Client registered successfully",
        user: {
          id: data.user.id,
          email: data.user.email,
          role: 'client',
          fullName,
          clientId: invitation.client_id
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Error registering client", error });
    }
  });

  // Portal del Cliente: Proyectos API
  app.get("/api/client-portal/projects", requireAuth, async (req: Request, res: Response) => {
    try {
      const { clientId } = req.query;
      
      if (!clientId) {
        return res.status(400).json({ message: "Client ID is required" });
      }
      
      const { data: projects, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('client_id', clientId);
      
      if (error) {
        return res.status(500).json({ message: "Error fetching projects", error });
      }
      
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Error fetching projects", error });
    }
  });

  app.get("/api/client-portal/projects/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      
      const { data: project, error } = await supabaseAdmin
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        return res.status(404).json({ message: "Project not found", error });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Error fetching project", error });
    }
  });

  app.post("/api/client-portal/projects", requireAuth, async (req: Request, res: Response) => {
    try {
      const validation = validateRequest(insertProjectSchema, req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Validation error", errors: validation.error });
      }
      
      const { data: project, error } = await supabaseAdmin
        .from('projects')
        .insert(validation.data)
        .select()
        .single();
      
      if (error) {
        return res.status(500).json({ message: "Error creating project", error });
      }
      
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Error creating project", error });
    }
  });

  app.put("/api/client-portal/projects/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const validation = validateRequest(insertProjectSchema.partial(), req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Validation error", errors: validation.error });
      }
      
      const { data: project, error } = await supabaseAdmin
        .from('projects')
        .update(validation.data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return res.status(404).json({ message: "Project not found", error });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Error updating project", error });
    }
  });

  app.delete("/api/client-portal/projects/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      
      const { error } = await supabaseAdmin
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) {
        return res.status(404).json({ message: "Error deleting project", error });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Error deleting project", error });
    }
  });

  // Portal del Cliente: Tareas API
  app.get("/api/client-portal/tasks", requireAuth, async (req: Request, res: Response) => {
    try {
      const { projectId } = req.query;
      
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required" });
      }
      
      const { data: tasks, error } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) {
        return res.status(500).json({ message: "Error fetching tasks", error });
      }
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Error fetching tasks", error });
    }
  });

  app.post("/api/client-portal/tasks", requireAuth, async (req: Request, res: Response) => {
    try {
      const validation = validateRequest(insertTaskSchema, req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Validation error", errors: validation.error });
      }
      
      const { data: task, error } = await supabaseAdmin
        .from('tasks')
        .insert(validation.data)
        .select()
        .single();
      
      if (error) {
        return res.status(500).json({ message: "Error creating task", error });
      }
      
      // Actualizar el progreso del proyecto
      await updateProjectProgress(validation.data.projectId);
      
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Error creating task", error });
    }
  });

  app.put("/api/client-portal/tasks/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const validation = validateRequest(insertTaskSchema.partial(), req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Validation error", errors: validation.error });
      }
      
      // Obtener la tarea actual para conocer su proyecto
      const { data: currentTask } = await supabaseAdmin
        .from('tasks')
        .select('project_id')
        .eq('id', id)
        .single();
        
      if (!currentTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const { data: task, error } = await supabaseAdmin
        .from('tasks')
        .update(validation.data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        return res.status(500).json({ message: "Error updating task", error });
      }
      
      // Actualizar el progreso del proyecto
      await updateProjectProgress(currentTask.project_id);
      
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Error updating task", error });
    }
  });

  // Función para actualizar el progreso de un proyecto basado en las tareas completadas
  async function updateProjectProgress(projectId: number) {
    try {
      // Obtener todas las tareas del proyecto
      const { data: tasks } = await supabaseAdmin
        .from('tasks')
        .select('*')
        .eq('project_id', projectId);
      
      if (!tasks || tasks.length === 0) return;
      
      // Calcular el progreso (porcentaje de tareas completadas)
      const completedTasks = tasks.filter(task => task.status === 'completed');
      const progressPercentage = Math.round((completedTasks.length / tasks.length) * 100);
      
      // Actualizar el progreso del proyecto
      await supabaseAdmin
        .from('projects')
        .update({ progress: progressPercentage })
        .eq('id', projectId);
    } catch (error) {
      console.error("Error updating project progress:", error);
    }
  }

  app.delete("/api/client-portal/tasks/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      
      // Obtener la tarea actual para conocer su proyecto
      const { data: currentTask } = await supabaseAdmin
        .from('tasks')
        .select('project_id')
        .eq('id', id)
        .single();
        
      if (!currentTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const { error } = await supabaseAdmin
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) {
        return res.status(500).json({ message: "Error deleting task", error });
      }
      
      // Actualizar el progreso del proyecto
      await updateProjectProgress(currentTask.project_id);
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Error deleting task", error });
    }
  });

  // Portal del Cliente: Registros de tiempo API
  app.get("/api/client-portal/time-entries", requireAuth, async (req: Request, res: Response) => {
    try {
      const { taskId } = req.query;
      
      if (!taskId) {
        return res.status(400).json({ message: "Task ID is required" });
      }
      
      const { data: timeEntries, error } = await supabaseAdmin
        .from('time_entries')
        .select('*')
        .eq('task_id', taskId);
      
      if (error) {
        return res.status(500).json({ message: "Error fetching time entries", error });
      }
      
      res.json(timeEntries);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      res.status(500).json({ message: "Error fetching time entries", error });
    }
  });

  app.post("/api/client-portal/time-entries", requireAuth, async (req: Request, res: Response) => {
    try {
      const validation = validateRequest(insertTimeEntrySchema, req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Validation error", errors: validation.error });
      }
      
      const { data: timeEntry, error } = await supabaseAdmin
        .from('time_entries')
        .insert(validation.data)
        .select()
        .single();
      
      if (error) {
        return res.status(500).json({ message: "Error creating time entry", error });
      }
      
      // Si incluye horas, actualizar las horas acumuladas de la tarea
      if (validation.data.hours) {
        // Obtener la tarea actual
        const { data: task } = await supabaseAdmin
          .from('tasks')
          .select('actual_hours')
          .eq('id', validation.data.taskId)
          .single();
          
        if (task) {
          const newHours = parseFloat(task.actual_hours || "0") + parseFloat(validation.data.hours.toString());
          
          await supabaseAdmin
            .from('tasks')
            .update({ actual_hours: newHours.toString() })
            .eq('id', validation.data.taskId);
        }
      }
      
      res.status(201).json(timeEntry);
    } catch (error) {
      console.error("Error creating time entry:", error);
      res.status(500).json({ message: "Error creating time entry", error });
    }
  });

  // Portal del Cliente: Citas y calendario API
  app.get("/api/client-portal/appointments", requireAuth, async (req: Request, res: Response) => {
    try {
      const { clientId, projectId, startDate, endDate } = req.query;
      
      let query = supabaseAdmin.from('appointments').select('*');
      
      if (clientId) {
        query = query.eq('client_id', clientId);
      } else if (projectId) {
        query = query.eq('project_id', projectId);
      } else {
        return res.status(400).json({ message: "Client ID or Project ID is required" });
      }
      
      const { data: appointments, error } = await query;
      
      if (error) {
        return res.status(500).json({ message: "Error fetching appointments", error });
      }
      
      // Filtrar por rango de fechas si se proporcionan
      let filteredAppointments = appointments;
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        
        filteredAppointments = appointments.filter(appointment => {
          const appointmentDate = new Date(appointment.start_time);
          return appointmentDate >= start && appointmentDate <= end;
        });
      }
      
      res.json(filteredAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Error fetching appointments", error });
    }
  });

  app.post("/api/client-portal/appointments", requireAuth, async (req: Request, res: Response) => {
    try {
      const validation = validateRequest(insertAppointmentSchema, req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Validation error", errors: validation.error });
      }
      
      const { data: appointment, error } = await supabaseAdmin
        .from('appointments')
        .insert(validation.data)
        .select()
        .single();
      
      if (error) {
        return res.status(500).json({ message: "Error creating appointment", error });
      }
      
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ message: "Error creating appointment", error });
    }
  });

  // API para enviar recordatorios de citas
  app.post("/api/client-portal/appointments/:id/send-reminder", requireAuth, async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      
      // Obtener la cita
      const { data: appointment, error } = await supabaseAdmin
        .from('appointments')
        .select('*, clients(*)')
        .eq('id', id)
        .single();
      
      if (error || !appointment) {
        return res.status(404).json({ message: "Appointment not found", error });
      }
      
      // TODO: Integrar con SendGrid para enviar correo electrónico
      // En una implementación real, aquí se enviaría el correo de recordatorio
      
      // Marcar la cita como que se ha enviado el recordatorio
      await supabaseAdmin
        .from('appointments')
        .update({ reminder_sent: true })
        .eq('id', id);
      
      res.json({ message: "Reminder sent successfully" });
    } catch (error) {
      console.error("Error sending appointment reminder:", error);
      res.status(500).json({ message: "Error sending appointment reminder", error });
    }
  });

  // API para Videoconferencias y Transcripciones

  // Inicializar el bucket de almacenamiento para grabaciones al arrancar el servidor
  initializeMeetingStorageBucket().catch(error => {
    console.error("Error initializing meeting recordings bucket:", error);
  });

  // Crear una nueva reunión
  app.post("/api/meetings", requireAuth, async (req: Request, res: Response) => {
    try {
      const validation = validateRequest(insertMeetingSchema, req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Validation error", errors: validation.error });
      }
      
      const meeting = await createMeeting(validation.data);
      res.status(201).json(meeting);
    } catch (error) {
      res.status(500).json({ message: "Error creating meeting", error });
    }
  });

  // Generar enlace para unirse a una reunión
  app.post("/api/meetings/:id/generate-link", requireAuth, async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.id);
      const { provider, appointmentId } = req.body;
      
      if (!provider || !['google_meet', 'zoom', 'teams', 'other'].includes(provider)) {
        return res.status(400).json({ message: "Invalid provider. Must be one of: google_meet, zoom, teams, other" });
      }
      
      const result = await generateMeetingLink(
        provider as MeetingProvider,
        meetingId,
        appointmentId || 0
      );
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Error generating meeting link", error });
    }
  });

  // Subir una grabación de reunión
  app.post("/api/meetings/:id/upload-recording", requireAuth, upload.single("recording"), async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.id);
      
      if (!req.file) {
        return res.status(400).json({ message: "No recording file provided" });
      }
      
      const recordingBuffer = req.file.buffer;
      const fileName = req.file.originalname || `recording-${Date.now()}.mp3`;
      
      const recordingUrl = await uploadMeetingRecording(meetingId, recordingBuffer, fileName);
      
      res.status(200).json({ recordingUrl });
    } catch (error) {
      res.status(500).json({ message: "Error uploading recording", error });
    }
  });

  // Obtener detalles de una reunión
  app.get("/api/meetings/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.id);
      const meetingDetails = await getMeetingDetails(meetingId);
      
      res.status(200).json(meetingDetails);
    } catch (error) {
      res.status(500).json({ message: "Error fetching meeting details", error });
    }
  });

  // Procesar una reunión grabada para obtener resumen y puntos clave
  app.post("/api/meetings/:id/process", requireAuth, async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.id);
      const result = await processMeetingData(meetingId);
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Error processing meeting data", error });
    }
  });

  // Endpoint para analizar texto directamente con Hugging Face
  app.post("/api/ai/analyze-text", requireAuth, async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Se requiere un texto para analizar' });
      }
      
      // Crear un segmento de transcripción temporal para simular una reunión
      // Esto nos permite reutilizar las funciones existentes para análisis de texto
      const [tempSegment] = await db.insert(transcriptionSegments)
        .values({
          meetingId: -1, // ID no existente para indicar que es temporal
          startTime: "0",
          endTime: "0",
          content: text,
          speakerId: null
        })
        .returning();
      
      try {
        // Extraer puntos clave y acciones del texto utilizando las funciones existentes
        const result = await extractKeyPointsAndActions(tempSegment.meetingId);
        
        // Generar un resumen del texto
        const summary = await generateMeetingSummary(tempSegment.meetingId);
        
        // Combinar los resultados
        const analyzed = {
          ...result,
          summary
        };
        
        res.json(analyzed);
      } finally {
        // Eliminar el segmento temporal de la base de datos
        await db.delete(transcriptionSegments)
          .where(eq(transcriptionSegments.id, tempSegment.id));
      }
    } catch (error: any) {
      console.error('Error al analizar texto:', error);
      res.status(500).json({ error: `Error al analizar texto: ${error.message}` });
    }
  });

  // Endpoint para pruebas de análisis de texto (sin autenticación)
  app.post("/api/test/analyze-text", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Se requiere un texto para analizar' });
      }
      
      // Usar el modelo de Hugging Face directamente para analizar el texto
      const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
      
      const result = await hf.textGeneration({
        model: 'google/gemma-7b',
        inputs: `
          Analiza el siguiente texto y extrae:
          1. Puntos clave (máximo 3)
          2. Un resumen conciso
          3. Acciones recomendadas
          
          Texto:
          ${text}
          
          Responde en formato JSON con las claves "keyPoints" (array), "summary" (string) y "actions" (array).
        `,
        parameters: {
          max_new_tokens: 512,
          return_full_text: false,
        }
      });
      
      // Intentar parsear la respuesta como JSON
      try {
        let jsonStr = result.generated_text.trim();
        
        // Encontrar el primer '{' y el último '}'
        const startIdx = jsonStr.indexOf('{');
        const endIdx = jsonStr.lastIndexOf('}') + 1;
        
        if (startIdx >= 0 && endIdx > startIdx) {
          jsonStr = jsonStr.substring(startIdx, endIdx);
        }
        
        const analyzed = JSON.parse(jsonStr);
        res.json(analyzed);
      } catch (parseError) {
        // Si no se puede parsear, devolver el texto completo
        res.json({ 
          raw: result.generated_text,
          error: 'No se pudo parsear la respuesta como JSON'
        });
      }
    } catch (error: any) {
      console.error('Error al analizar texto (test):', error);
      res.status(500).json({ error: `Error al analizar texto: ${error.message}` });
    }
  });

  // Obtener segmentos de transcripción de una reunión
  app.get("/api/meetings/:id/transcription", requireAuth, async (req: Request, res: Response) => {
    try {
      const meetingId = parseInt(req.params.id);
      
      const segments = await db.select()
        .from(transcriptionSegments)
        .where(eq(transcriptionSegments.meetingId, meetingId))
        .orderBy(transcriptionSegments.startTime);
      
      res.status(200).json(segments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching transcription segments", error });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
