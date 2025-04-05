import { pgTable, text, serial, integer, numeric, timestamp, boolean, pgEnum, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum para roles de usuario
export const userRoleEnum = pgEnum("user_role", [
  "gerente_general",
  "contabilidad",
  "director_ventas",
  "director_recursos_humanos",
  "director_produccion",
  "director_logistica",
  "operario",
  "vendedor",
  "administrador_sistema"
]);

// Auth user model - basic structure to be extended with Clerk
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  role: userRoleEnum("role").default("contabilidad").notNull(),
  clerkId: text("clerk_id").unique(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Client Type enum
export const clientTypeEnum = pgEnum("client_type", [
  "company", "individual"
]);

// Payment terms enum
export const paymentTermsEnum = pgEnum("payment_terms", [
  "immediate", "15_days", "30_days", "45_days", "60_days", "custom"
]);

// Client/Customer model
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  // Campo name requerido por la base de datos
  name: text("name").notNull(),
  clientType: clientTypeEnum("client_type").default("company").notNull(),
  companyName: text("company_name"),
  displayName: text("display_name"),
  salutation: text("salutation"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  workPhone: text("work_phone"),
  mobilePhone: text("mobile_phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),
  taxId: text("tax_id"),
  paymentTerms: paymentTermsEnum("payment_terms").default("30_days"),
  customPaymentTerms: text("custom_payment_terms"),
  hasPortalAccess: boolean("has_portal_access").default(false),
  notes: text("notes"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Quote/Estimación status enum
export const quoteStatusEnum = pgEnum("quote_status", [
  "draft", "sent", "accepted", "rejected", "expired", "converted"
]);

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

// Quote/Presupuesto model
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  quoteNumber: text("quote_number").notNull().unique(),
  clientId: integer("client_id").notNull(),
  issueDate: timestamp("issue_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  status: quoteStatusEnum("status").default("draft").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  taxAmount: numeric("tax_amount", { precision: 10, scale: 2 }).default("0"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  convertedToInvoiceId: integer("converted_to_invoice_id"),
  notes: text("notes"),
  termsAndConditions: text("terms_and_conditions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Quote items model
export const quoteItems = pgTable("quote_items", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id").notNull(),
  description: text("description").notNull(),
  quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  taxRate: numeric("tax_rate", { precision: 5, scale: 2 }).default("0"),
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
  "invoice", "quote", "receipt", "contract", "report", "tax", "other",
  "client", "expense", "product", // Nuevas categorías para organización de archivos
  "client_document", "invoice_attachment", "quote_attachment", "expense_receipt", "product_image"
]);

// Enum para el estado de proyectos
export const projectStatusEnum = pgEnum("project_status", [
  "pending", "in_progress", "completed", "cancelled", "on_hold"
]);

// Enum para la prioridad de tareas
export const taskPriorityEnum = pgEnum("task_priority", [
  "low", "medium", "high", "urgent"
]);

// Enum para el estado de tareas
export const taskStatusEnum = pgEnum("task_status", [
  "pending", "in_progress", "completed", "cancelled"
]);

// Enum para el tipo de cita
export const appointmentTypeEnum = pgEnum("appointment_type", [
  "meeting", "call", "video_call", "other"
]);

// Modelo de archivos
export const files = pgTable("files", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  size: integer("size").notNull(),
  mimeType: text("mime_type").notNull(),
  clientId: integer("client_id"),
  projectId: integer("project_id"),
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
  message: text("message"),
  status: text("status").default("pendiente"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Modelo para autenticación de clientes en el portal
export const clientPortalUsers = pgTable("client_portal_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: integer("client_id").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  lastLogin: timestamp("last_login"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Modelo para proyectos
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  clientId: integer("client_id").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  status: projectStatusEnum("status").default("pending").notNull(),
  progress: integer("progress").default(0).notNull(),
  userId: uuid("user_id").notNull(), // Creador/propietario del proyecto
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Modelo para tareas en proyectos
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  projectId: integer("project_id").notNull(),
  assignedTo: uuid("assigned_to").notNull(),
  dueDate: timestamp("due_date"),
  priority: taskPriorityEnum("priority").default("medium").notNull(),
  status: taskStatusEnum("status").default("pending").notNull(),
  estimatedHours: numeric("estimated_hours", { precision: 5, scale: 2 }),
  actualHours: numeric("actual_hours", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Modelo para registros de tiempo en tareas
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  userId: uuid("user_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  description: text("description"),
  hours: numeric("hours", { precision: 5, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Modelo para citas y calendario
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  clientId: integer("client_id").notNull(),
  projectId: integer("project_id"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  type: appointmentTypeEnum("type").default("meeting").notNull(),
  meetingUrl: text("meeting_url"), // URL para reuniones de Google Meet
  reminderSent: boolean("reminder_sent").default(false).notNull(),
  userId: uuid("user_id").notNull(), // Creador de la cita
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enum para proveedores de videollamadas
export const meetingProviderEnum = pgEnum("meeting_provider", [
  "google_meet", "zoom", "teams", "other"
]);

// Enum para el estado de la transcripción
export const transcriptionStatusEnum = pgEnum("transcription_status", [
  "pending", "in_progress", "completed", "failed"
]);

// Modelo para reuniones grabadas
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  appointmentId: integer("appointment_id"),
  projectId: integer("project_id"),
  clientId: integer("client_id").notNull(),
  provider: meetingProviderEnum("provider").default("google_meet").notNull(),
  externalMeetingId: text("external_meeting_id"), // ID de la reunión en Google Meet o Zoom
  meetingUrl: text("meeting_url"), // URL para unirse a la reunión
  recordingUrl: text("recording_url"), // URL de la grabación
  recordingStatus: text("recording_status").default("not_started"),
  transcriptionStatus: transcriptionStatusEnum("transcription_status").default("pending"),
  transcription: text("transcription"), // Transcripción completa del texto
  summary: text("summary"), // Resumen generado por AI
  duration: integer("duration"), // Duración en minutos
  meetingDate: timestamp("meeting_date").notNull(),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  participants: text("participants").array(), // Lista de participantes
  keyPoints: text("key_points").array(), // Puntos clave identificados por AI
  actionItems: text("action_items").array(), // Acciones a realizar identificadas por AI
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Modelo para segmentos de transcripción en tiempo real
export const transcriptionSegments = pgTable("transcription_segments", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull(),
  speakerName: text("speaker_name"),
  speakerId: text("speaker_id"),
  content: text("content").notNull(),
  startTime: numeric("start_time", { precision: 10, scale: 3 }).notNull(), // Tiempo de inicio en segundos
  endTime: numeric("end_time", { precision: 10, scale: 3 }).notNull(), // Tiempo de fin en segundos
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Modelo para integración con proveedores de videollamadas
export const meetingIntegrations = pgTable("meeting_integrations", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  provider: meetingProviderEnum("provider").notNull(),
  accessToken: text("access_token"), // Token OAuth para autenticación
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  settings: text("settings").array(), // Configuraciones específicas por proveedor
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enum para tipos de acciones de auditoría
export const auditActionEnum = pgEnum("audit_action", [
  "create", "update", "delete", "view", "export", "import", "restore", "login", "logout", "other"
]);

// Enum para tipos de entidades en auditoría
export const auditEntityEnum = pgEnum("audit_entity", [
  "client", "invoice", "quote", "expense", "account", "journal", "file", "project", "task", "appointment", "user", "setting", "other"
]);

// Modelo para registrar acciones de auditoría
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(), // Usuario que realizó la acción
  userName: text("user_name"), // Nombre del usuario que realizó la acción
  userRole: text("user_role"), // Rol del usuario que realizó la acción
  action: auditActionEnum("action").notNull(), // Tipo de acción realizada
  entityType: auditEntityEnum("entity_type").notNull(), // Tipo de entidad afectada
  entityId: text("entity_id").notNull(), // ID de la entidad afectada (puede ser numérico o UUID)
  entityName: text("entity_name"), // Nombre descriptivo de la entidad afectada
  details: text("details"), // Detalles adicionales (JSON)
  changes: text("changes"), // Cambios realizados en formato JSON (antes/después)
  ipAddress: text("ip_address"), // Dirección IP desde donde se realizó la acción
  userAgent: text("user_agent"), // Detalles del navegador/dispositivo
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for validation
export const insertUserSchema = createInsertSchema(users)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertClientSchema = createInsertSchema(clients)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertQuoteSchema = createInsertSchema(quotes)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertQuoteItemSchema = createInsertSchema(quoteItems)
  .omit({ id: true });

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

export const insertClientPortalUserSchema = createInsertSchema(clientPortalUsers)
  .omit({ id: true, lastLogin: true, createdAt: true, updatedAt: true });

export const insertProjectSchema = createInsertSchema(projects)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertTaskSchema = createInsertSchema(tasks)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertTimeEntrySchema = createInsertSchema(timeEntries)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertAppointmentSchema = createInsertSchema(appointments)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertMeetingSchema = createInsertSchema(meetings)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertTranscriptionSegmentSchema = createInsertSchema(transcriptionSegments)
  .omit({ id: true, createdAt: true });

export const insertMeetingIntegrationSchema = createInsertSchema(meetingIntegrations)
  .omit({ id: true, createdAt: true, updatedAt: true });

export const insertAuditLogSchema = createInsertSchema(auditLogs)
  .omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserRole = "gerente_general" | "contabilidad" | "director_ventas" | "director_recursos_humanos" | "director_produccion" | "director_logistica" | "operario" | "vendedor" | "administrador_sistema";

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type ClientType = "company" | "individual";
export type PaymentTerms = "immediate" | "15_days" | "30_days" | "45_days" | "60_days" | "custom";

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type QuoteStatus = "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";

export type QuoteItem = typeof quoteItems.$inferSelect;
export type InsertQuoteItem = z.infer<typeof insertQuoteItemSchema>;

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
export type FileCategory = "invoice" | "quote" | "receipt" | "contract" | "report" | "tax" | "other" |
  "client" | "expense" | "product" | "client_document" | "invoice_attachment" | "quote_attachment" | 
  "expense_receipt" | "product_image";

export type ClientInvitation = typeof clientInvitations.$inferSelect;
export type InsertClientInvitation = z.infer<typeof insertClientInvitationSchema>;

export type ClientPortalUser = typeof clientPortalUsers.$inferSelect;
export type InsertClientPortalUser = z.infer<typeof insertClientPortalUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ProjectStatus = "pending" | "in_progress" | "completed" | "cancelled" | "on_hold";

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type AppointmentType = "meeting" | "call" | "video_call" | "other";

export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type MeetingProvider = "google_meet" | "zoom" | "teams" | "other";
export type TranscriptionStatus = "pending" | "in_progress" | "completed" | "failed";

export type TranscriptionSegment = typeof transcriptionSegments.$inferSelect;
export type InsertTranscriptionSegment = z.infer<typeof insertTranscriptionSegmentSchema>;

export type MeetingIntegration = typeof meetingIntegrations.$inferSelect;
export type InsertMeetingIntegration = z.infer<typeof insertMeetingIntegrationSchema>;

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditAction = "create" | "update" | "delete" | "view" | "export" | "import" | "restore" | "login" | "logout" | "other";
export type AuditEntity = "client" | "invoice" | "quote" | "expense" | "account" | "journal" | "file" | "project" | "task" | "appointment" | "user" | "setting" | "other";
