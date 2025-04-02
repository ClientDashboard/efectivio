import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertClientSchema, 
  insertProductSchema, 
  insertInvoiceSchema,
  insertExpenseSchema
} from "@shared/schema";
import { db } from "./db";
import { clients, products, invoices, expenses, invoiceItems } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // In a real app, you would generate a JWT token here
      res.json({ user: { ...user, password: undefined } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "An error occurred during login" });
    }
  });

  // Clients routes
  app.get("/api/clients", async (req: Request, res: Response) => {
    try {
      const allClients = await db.select().from(clients).orderBy(desc(clients.name));
      res.json(allClients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.post("/api/clients", async (req: Request, res: Response) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const [newClient] = await db.insert(clients).values(validatedData).returning();
      res.status(201).json(newClient);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(400).json({ error: "Invalid client data" });
    }
  });

  app.get("/api/clients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const [client] = await db.select().from(clients).where(eq(clients.id, id));
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  // Products routes
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const allProducts = await db.select().from(products).orderBy(desc(products.name));
      res.json(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const [newProduct] = await db.insert(products).values(validatedData).returning();
      res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  // Invoices routes
  app.get("/api/invoices", async (req: Request, res: Response) => {
    try {
      const allInvoices = await db.select({
        id: invoices.id,
        invoice_number: invoices.invoice_number,
        client_id: invoices.client_id,
        client_name: clients.name,
        issue_date: invoices.issue_date,
        due_date: invoices.due_date,
        total: invoices.total,
        status: invoices.status
      })
      .from(invoices)
      .leftJoin(clients, eq(invoices.client_id, clients.id))
      .orderBy(desc(invoices.issue_date));
      
      res.json(allInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.post("/api/invoices", async (req: Request, res: Response) => {
    try {
      const { invoice, items } = req.body;
      const validatedInvoice = insertInvoiceSchema.parse(invoice);
      
      // Start a transaction to ensure both invoice and items are saved together
      const result = await db.transaction(async (tx) => {
        // Insert invoice
        const [newInvoice] = await tx.insert(invoices)
          .values(validatedInvoice)
          .returning();
        
        // Insert invoice items
        if (items && items.length > 0) {
          const itemsWithInvoiceId = items.map((item: any) => ({
            ...item,
            invoice_id: newInvoice.id
          }));
          
          await tx.insert(invoiceItems).values(itemsWithInvoiceId);
        }
        
        return newInvoice;
      });
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(400).json({ error: "Invalid invoice data" });
    }
  });

  // Expenses routes
  app.get("/api/expenses", async (req: Request, res: Response) => {
    try {
      const allExpenses = await db.select().from(expenses).orderBy(desc(expenses.date));
      res.json(allExpenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.post("/api/expenses", async (req: Request, res: Response) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const [newExpense] = await db.insert(expenses).values(validatedData).returning();
      res.status(201).json(newExpense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(400).json({ error: "Invalid expense data" });
    }
  });

  // Dashboard data route
  app.get("/api/dashboard", async (req: Request, res: Response) => {
    try {
      // Total invoices by status
      const invoiceCounts = await db
        .select({
          status: invoices.status,
          count: sql<number>`count(*)`,
          sum: sql<string>`sum(${invoices.total})`
        })
        .from(invoices)
        .groupBy(invoices.status);
      
      // Total expenses by status
      const expenseCounts = await db
        .select({
          status: expenses.status,
          count: sql<number>`count(*)`,
          sum: sql<string>`sum(${expenses.amount})`
        })
        .from(expenses)
        .groupBy(expenses.status);
      
      // Recent invoices
      const recentInvoices = await db
        .select({
          id: invoices.id,
          invoice_number: invoices.invoice_number,
          client_name: clients.name,
          issue_date: invoices.issue_date,
          total: invoices.total,
          status: invoices.status
        })
        .from(invoices)
        .leftJoin(clients, eq(invoices.client_id, clients.id))
        .orderBy(desc(invoices.issue_date))
        .limit(5);
      
      // Recent expenses
      const recentExpenses = await db
        .select()
        .from(expenses)
        .orderBy(desc(expenses.date))
        .limit(5);
      
      res.json({
        invoices: {
          counts: invoiceCounts,
          recent: recentInvoices
        },
        expenses: {
          counts: expenseCounts,
          recent: recentExpenses
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
