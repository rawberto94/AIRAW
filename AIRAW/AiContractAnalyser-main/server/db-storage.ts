import { 
   users, type User, type InsertUser,
   complianceRules, type ComplianceRule, type InsertComplianceRule,
   clauses, type Clause, type InsertClause,
   contractSummaries, type ContractSummary, type InsertContractSummary, type ContractSummaryDB
} from "../shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";