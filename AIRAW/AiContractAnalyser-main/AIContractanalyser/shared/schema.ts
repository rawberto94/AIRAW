import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const complianceRules = pgTable("compliance_rules", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  allowed: boolean("allowed").notNull().default(true),
  riskScore: integer("risk_score").default(5), // Default risk score of 5 (medium)
  category: text("category"),
  description: text("description"),
});

export const clauses = pgTable("clauses", {
  id: serial("id").primaryKey(),
  clause: text("clause").notNull(),
  section: text("section"),
  page: integer("page"),
  category: text("category"),
  risk_score: integer("risk_score").notNull(),
  compliance_status: text("compliance_status").notNull(),
  document_id: text("document_id").notNull(),
  completed: boolean("completed").default(false),
});

export const contractSummaries = pgTable("contract_summaries", {
  id: serial("id").primaryKey(),
  documentId: text("document_id").notNull().unique(),
  title: text("title"),
  parties: jsonb("parties"),
  effectiveDate: text("effective_date"),
  termLength: text("term_length"),
  paymentTerms: jsonb("payment_terms"),
  rateCard: jsonb("rate_card"),
  fees: jsonb("fees"),
  keyObligations: jsonb("key_obligations"),
  confidentialityTerms: text("confidentiality_terms"),
  terminationClauses: jsonb("termination_clauses"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertComplianceRuleSchema = createInsertSchema(complianceRules).pick({
  keyword: true,
  allowed: true,
  riskScore: true,
  category: true,
  description: true,
});

export const insertClauseSchema = createInsertSchema(clauses).omit({
  id: true,
});

export const insertContractSummarySchema = createInsertSchema(contractSummaries).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertComplianceRule = z.infer<typeof insertComplianceRuleSchema>;
export type ComplianceRule = typeof complianceRules.$inferSelect;

export type InsertClause = z.infer<typeof insertClauseSchema>;
export type Clause = typeof clauses.$inferSelect;

export type InsertContractSummary = z.infer<typeof insertContractSummarySchema>;
export type ContractSummaryDB = typeof contractSummaries.$inferSelect;

// Contract summary schema
export const contractSummarySchema = z.object({
  documentId: z.string(),
  title: z.string().optional(),
  parties: z.object({
    party1: z.string().optional(),
    party2: z.string().optional(),
  }).optional(),
  effectiveDate: z.string().optional(),
  termLength: z.string().optional(),
  paymentTerms: z.array(z.string()).optional(),
  rateCard: z.array(z.object({
    item: z.string(),
    rate: z.string(),
    unit: z.string().optional(),
  })).optional(),
  fees: z.array(z.object({
    name: z.string(),
    amount: z.string(),
    frequency: z.string().optional(),
    description: z.string().optional(),
    category: z.string().optional(),
  })).optional(),
  keyObligations: z.array(z.string()).optional(),
  confidentialityTerms: z.string().optional(),
  terminationClauses: z.array(z.string()).optional(),
});

export type ContractSummary = z.infer<typeof contractSummarySchema>;
