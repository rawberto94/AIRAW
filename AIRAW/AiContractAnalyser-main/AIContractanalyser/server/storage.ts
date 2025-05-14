import { 
  users, type User, type InsertUser,
  complianceRules, type ComplianceRule, type InsertComplianceRule,
  clauses, type Clause, type InsertClause,
  type ContractSummary
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Compliance rule operations
  getComplianceRule(id: number): Promise<ComplianceRule | undefined>;
  getAllComplianceRules(): Promise<ComplianceRule[]>;
  createComplianceRule(rule: InsertComplianceRule): Promise<ComplianceRule>;
  updateComplianceRule(id: number, rule: InsertComplianceRule): Promise<ComplianceRule | undefined>;
  deleteComplianceRule(id: number): Promise<boolean>;
  
  // Clause operations
  getClause(id: number): Promise<Clause | undefined>;
  getAllClauses(): Promise<Clause[]>;
  getClausesByDocumentId(documentId: string): Promise<Clause[]>;
  createClause(clause: InsertClause): Promise<Clause>;
  updateClause(id: number, clause: Partial<Clause>): Promise<Clause | undefined>;
  deleteClause(id: number): Promise<boolean>;
  
  // Contract summary operations
  getContractSummary(documentId: string): Promise<ContractSummary | undefined>;
  createContractSummary(summary: ContractSummary): Promise<ContractSummary>;
  updateContractSummary(documentId: string, summary: ContractSummary): Promise<ContractSummary | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private complianceRulesList: Map<number, ComplianceRule>;
  private clausesList: Map<number, Clause>;
  private contractSummaries: Map<string, ContractSummary>;
  
  private userCurrentId: number;
  private ruleCurrentId: number;
  private clauseCurrentId: number;

  constructor() {
    this.users = new Map();
    this.complianceRulesList = new Map();
    this.clausesList = new Map();
    this.contractSummaries = new Map();
    
    this.userCurrentId = 1;
    this.ruleCurrentId = 1;
    this.clauseCurrentId = 1;
    
    // Add some initial compliance rules
    this.createComplianceRule({ keyword: "Non-disclosure agreement", allowed: true });
    this.createComplianceRule({ keyword: "Liability clause", allowed: false });
    this.createComplianceRule({ keyword: "Intellectual property rights", allowed: true });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Compliance rule methods
  async getComplianceRule(id: number): Promise<ComplianceRule | undefined> {
    return this.complianceRulesList.get(id);
  }
  
  async getAllComplianceRules(): Promise<ComplianceRule[]> {
    return Array.from(this.complianceRulesList.values());
  }
  
  async createComplianceRule(rule: InsertComplianceRule): Promise<ComplianceRule> {
    const id = this.ruleCurrentId++;
    const newRule: ComplianceRule = { ...rule, id };
    this.complianceRulesList.set(id, newRule);
    return newRule;
  }
  
  async updateComplianceRule(id: number, rule: InsertComplianceRule): Promise<ComplianceRule | undefined> {
    const existingRule = this.complianceRulesList.get(id);
    
    if (!existingRule) {
      return undefined;
    }
    
    const updatedRule: ComplianceRule = { ...rule, id };
    this.complianceRulesList.set(id, updatedRule);
    
    return updatedRule;
  }
  
  async deleteComplianceRule(id: number): Promise<boolean> {
    return this.complianceRulesList.delete(id);
  }
  
  // Clause methods
  async getClause(id: number): Promise<Clause | undefined> {
    return this.clausesList.get(id);
  }
  
  async getAllClauses(): Promise<Clause[]> {
    return Array.from(this.clausesList.values());
  }
  
  async getClausesByDocumentId(documentId: string): Promise<Clause[]> {
    return Array.from(this.clausesList.values()).filter(
      (clause) => clause.document_id === documentId
    );
  }
  
  async createClause(clause: InsertClause): Promise<Clause> {
    const id = this.clauseCurrentId++;
    const newClause: Clause = { ...clause, id };
    this.clausesList.set(id, newClause);
    return newClause;
  }
  
  async deleteClause(id: number): Promise<boolean> {
    return this.clausesList.delete(id);
  }
  
  async updateClause(id: number, clause: Partial<Clause>): Promise<Clause | undefined> {
    const existingClause = this.clausesList.get(id);
    
    if (!existingClause) {
      return undefined;
    }
    
    const updatedClause: Clause = { ...existingClause, ...clause };
    this.clausesList.set(id, updatedClause);
    
    return updatedClause;
  }

  // Contract summary methods
  async getContractSummary(documentId: string): Promise<ContractSummary | undefined> {
    return this.contractSummaries.get(documentId);
  }

  async createContractSummary(summary: ContractSummary): Promise<ContractSummary> {
    this.contractSummaries.set(summary.documentId, summary);
    return summary;
  }

  async updateContractSummary(documentId: string, summary: ContractSummary): Promise<ContractSummary | undefined> {
    const existingSummary = this.contractSummaries.get(documentId);
    
    if (!existingSummary) {
      return undefined;
    }
    
    this.contractSummaries.set(documentId, summary);
    return summary;
  }
}

// Import and use the DatabaseStorage
import { DatabaseStorage } from "./db-storage";
export const storage = new DatabaseStorage();
