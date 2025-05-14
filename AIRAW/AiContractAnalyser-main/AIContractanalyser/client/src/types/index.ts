export interface ClauseType {
  id?: number;
  clause: string;
  section?: string;
  page?: number;
  category?: string;
  risk_score: number;
  compliance_status: "Compliant" | "Non-Compliant" | "Review Needed";
  document_id: string;
  completed?: boolean;
  tags?: string[];
  recommendations?: Recommendation[];
  compliance_issues?: ComplianceIssue[];
}

export interface ComplianceRuleType {
  id?: number;
  keyword: string;
  allowed: boolean;
  riskScore?: number; // Risk score assigned to violations of this rule (1-10)
  category?: string; // Category of the rule (e.g., "Payment Terms", "Liability", "Confidentiality")
  description?: string; // Detailed description of the rule
}

export interface Recommendation {
  title: string;
  description: string;
}

export interface ComplianceIssue {
  issue: string;
  rule?: string;
  description: string;
}

export interface RiskAssessment {
  score: number;
  level: "high" | "medium" | "low";
  description: string;
}

export type FilterType = "all" | "compliant" | "non-compliant" | "high-risk";
export type SortType = "risk" | "compliance";
