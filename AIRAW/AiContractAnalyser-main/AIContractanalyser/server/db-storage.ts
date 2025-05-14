import { 
  users, type User, type InsertUser,
  complianceRules, type ComplianceRule, type InsertComplianceRule,
  clauses, type Clause, type InsertClause,
  contractSummaries, type ContractSummary, type InsertContractSummary, type ContractSummaryDB
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async getComplianceRule(id: number): Promise<ComplianceRule | undefined> {
    const [rule] = await db.select().from(complianceRules).where(eq(complianceRules.id, id));
    return rule;
  }
  
  async getAllComplianceRules(): Promise<ComplianceRule[]> {
    return await db.select().from(complianceRules);
  }
  
  async createComplianceRule(rule: InsertComplianceRule): Promise<ComplianceRule> {
    // Ensure required values are set
    const insertData = {
      ...rule,
      allowed: rule.allowed ?? true,
      riskScore: rule.riskScore ?? 5
    };
    const [newRule] = await db.insert(complianceRules).values(insertData).returning();
    return newRule;
  }
  
  async updateComplianceRule(id: number, rule: InsertComplianceRule): Promise<ComplianceRule | undefined> {
    const [existingRule] = await db.select().from(complianceRules).where(eq(complianceRules.id, id));
    
    if (!existingRule) {
      return undefined;
    }
    
    // Merge with existing data to ensure required fields remain populated
    const updateData = {
      ...rule,
      allowed: rule.allowed ?? existingRule.allowed,
      riskScore: rule.riskScore ?? existingRule.riskScore
    };
    
    const [updatedRule] = await db
      .update(complianceRules)
      .set(updateData)
      .where(eq(complianceRules.id, id))
      .returning();
    
    return updatedRule;
  }
  
  async deleteComplianceRule(id: number): Promise<boolean> {
    await db.delete(complianceRules).where(eq(complianceRules.id, id));
    return true; // In PostgreSQL, we don't get a direct indication of whether a row was deleted
  }
  
  async getClause(id: number): Promise<Clause | undefined> {
    const [clause] = await db.select().from(clauses).where(eq(clauses.id, id));
    return clause;
  }
  
  async getAllClauses(): Promise<Clause[]> {
    return await db.select().from(clauses);
  }
  
  async getClausesByDocumentId(documentId: string): Promise<Clause[]> {
    return await db
      .select()
      .from(clauses)
      .where(eq(clauses.document_id, documentId));
  }
  
  async createClause(clause: InsertClause): Promise<Clause> {
    const [newClause] = await db.insert(clauses).values(clause).returning();
    return newClause;
  }
  
  async deleteClause(id: number): Promise<boolean> {
    await db.delete(clauses).where(eq(clauses.id, id));
    return true;
  }
  
  async updateClause(id: number, clause: Partial<Clause>): Promise<Clause | undefined> {
    const [existingClause] = await db.select().from(clauses).where(eq(clauses.id, id));
    
    if (!existingClause) {
      return undefined;
    }
    
    const [updatedClause] = await db
      .update(clauses)
      .set(clause)
      .where(eq(clauses.id, id))
      .returning();
    
    return updatedClause;
  }
  
  async getContractSummary(documentId: string): Promise<ContractSummary | undefined> {
    const [summary] = await db
      .select()
      .from(contractSummaries)
      .where(eq(contractSummaries.documentId, documentId));
    
    if (!summary) {
      return undefined;
    }
    
    // Transform DB representation to ContractSummary 
    return {
      documentId: summary.documentId,
      title: summary.title || undefined,
      parties: summary.parties as ContractSummary['parties'],
      effectiveDate: summary.effectiveDate || undefined,
      termLength: summary.termLength || undefined,
      paymentTerms: summary.paymentTerms as ContractSummary['paymentTerms'],
      rateCard: summary.rateCard as ContractSummary['rateCard'],
      fees: summary.fees as ContractSummary['fees'],
      keyObligations: summary.keyObligations as ContractSummary['keyObligations'],
      confidentialityTerms: summary.confidentialityTerms || undefined,
      terminationClauses: summary.terminationClauses as ContractSummary['terminationClauses'],
    };
  }

  async createContractSummary(summary: ContractSummary): Promise<ContractSummary> {
    // Transform ContractSummary to DB representation
    const dbSummary: InsertContractSummary = {
      documentId: summary.documentId,
      title: summary.title || null,
      parties: summary.parties || null,
      effectiveDate: summary.effectiveDate || null,
      termLength: summary.termLength || null,
      paymentTerms: summary.paymentTerms || null,
      rateCard: summary.rateCard || null,
      fees: summary.fees || null,
      keyObligations: summary.keyObligations || null,
      confidentialityTerms: summary.confidentialityTerms || null,
      terminationClauses: summary.terminationClauses || null,
    };
    
    // Use upsert to handle potential duplicates
    const [newSummary] = await db
      .insert(contractSummaries)
      .values(dbSummary)
      .onConflictDoUpdate({
        target: contractSummaries.documentId,
        set: dbSummary
      })
      .returning();
    
    // Return the original summary format
    return summary;
  }

  async updateContractSummary(documentId: string, summary: ContractSummary): Promise<ContractSummary | undefined> {
    const [existingSummary] = await db
      .select()
      .from(contractSummaries)
      .where(eq(contractSummaries.documentId, documentId));
    
    if (!existingSummary) {
      return undefined;
    }
    
    // Transform ContractSummary to DB representation
    const dbSummary: InsertContractSummary = {
      documentId: summary.documentId,
      title: summary.title || null,
      parties: summary.parties || null,
      effectiveDate: summary.effectiveDate || null,
      termLength: summary.termLength || null,
      paymentTerms: summary.paymentTerms || null,
      rateCard: summary.rateCard || null,
      fees: summary.fees || null,
      keyObligations: summary.keyObligations || null,
      confidentialityTerms: summary.confidentialityTerms || null,
      terminationClauses: summary.terminationClauses || null,
    };
    
    await db
      .update(contractSummaries)
      .set(dbSummary)
      .where(eq(contractSummaries.documentId, documentId));
    
    // Return the original summary format
    return summary;
  }
}