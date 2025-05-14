import OpenAI from 'openai';
import { ComplianceRule } from '@shared/schema';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = 'gpt-4o';

// Initialize OpenAI API client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Use OpenAI to extract clauses from a contract document
 * @param text - The document text content
 * @returns Array of identified clauses
 */
export async function extractClausesWithAI(text: string): Promise<string[]> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert contract analyst that can identify distinct clauses in legal documents. 
          Analyze the provided contract text and extract individual clauses. 
          Each clause should be complete and self-contained, focusing on a single legal provision or concept.
          Return them as a JSON array of strings, with each string being a complete clause.`
        },
        {
          role: 'user',
          content: text.length > 15000 ? text.substring(0, 15000) + '...' : text
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      return [];
    }
    
    const result = JSON.parse(content);
    return result.clauses || [];
  } catch (error) {
    console.error('Error extracting clauses with AI:', error);
    // Fall back to basic extraction
    return text.split(/(?:\r?\n){2,}/).filter(clause => clause.trim().length > 50);
  }
}

/**
 * Use OpenAI to analyze clauses against compliance rules
 * @param clause - The clause text to analyze
 * @param rules - Array of compliance rules
 * @returns Analysis result with compliance status, risk score, etc.
 */
export async function analyzeClauseWithAI(
  clause: string, 
  rules: ComplianceRule[],
  section?: string
): Promise<{
  compliance_status: 'Compliant' | 'Non-Compliant' | 'Review Needed';
  risk_score: number;
  category: string;
  recommendations: { title: string; description: string }[];
  compliance_issues: { issue: string; rule?: string; description: string }[];
}> {
  try {
    // Format rules for the prompt
    const rulesText = rules.map(rule => 
      `Rule ${rule.id}: Keywords "${rule.keyword}" are ${rule.allowed ? 'allowed' : 'not allowed'}. Risk score: ${rule.riskScore || 5}. Category: ${rule.category || 'General'}. ${rule.description || ''}`
    ).join('\n');

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert contract analyst that can evaluate contract clauses against compliance rules.
          Analyze the given clause against the provided compliance rules and determine:
          1. compliance_status: Whether it's "Compliant", "Non-Compliant", or "Review Needed"
          2. risk_score: A score from 1-10 (10 being highest risk)
          3. category: The category of the clause (e.g., "Liability", "Payment Terms", "Confidentiality")
          4. recommendations: List of recommendation objects with "title" and "description" fields
          5. compliance_issues: List of issue objects with "issue", "rule" (optional), and "description" fields
          
          Respond with JSON only.`
        },
        {
          role: 'user',
          content: `Clause to analyze: "${clause}"\n\nSection: ${section || 'Not specified'}\n\nCompliance Rules:\n${rulesText}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in response');
    }
    
    const result = JSON.parse(content);
    return {
      compliance_status: result.compliance_status || 'Review Needed',
      risk_score: result.risk_score || 5,
      category: result.category || (section || 'General'),
      recommendations: result.recommendations || [],
      compliance_issues: result.compliance_issues || []
    };
  } catch (error) {
    console.error('Error analyzing clause with AI:', error);
    // Return default analysis if AI fails
    return {
      compliance_status: 'Review Needed',
      risk_score: 5,
      category: section || 'General',
      recommendations: [{ 
        title: 'AI Analysis Failed', 
        description: 'The automated analysis could not be completed. Please review this clause manually.' 
      }],
      compliance_issues: []
    };
  }
}

/**
 * Use OpenAI to generate a comprehensive bullet point summary of a contract
 * @param documentId - The ID of the document
 * @param contractSummary - The existing contract summary data
 * @param clauses - The extracted clauses from the document
 * @returns Array of bullet points summarizing the contract
 */
export async function generateBulletSummaryWithAI(
  documentId: string,
  contractSummary: any,
  clauses: any[]
): Promise<string[]> {
  try {
    // Extract key information from the contract summary
    const summaryText = JSON.stringify(contractSummary, null, 2);
    const clauseCount = clauses.length;
    const highRiskCount = clauses.filter(c => c.risk_score >= 7).length;
    const nonCompliantCount = clauses.filter(c => c.compliance_status === 'Non-Compliant').length;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert contract analyst that can create clear, concise bullet point summaries of legal documents.
          Based on the provided contract summary and statistics, generate a set of bullet points that highlight:
          1. Key parties and dates
          2. Important financial terms (payment terms, fees, rates)
          3. Major obligations and rights
          4. Risk and compliance assessment
          5. Termination conditions
          6. Any other critical contract elements
          
          Format each point as a complete sentence ending with a period. Be concise and direct.
          Respond with a JSON object containing an array of strings named "bulletPoints".`
        },
        {
          role: 'user',
          content: `Contract Summary: ${summaryText}\n\nDocument Statistics:\n- Total Clauses: ${clauseCount}\n- High Risk Clauses: ${highRiskCount}\n- Non-Compliant Clauses: ${nonCompliantCount}`
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in response');
    }
    
    const result = JSON.parse(content);
    return result.bulletPoints || [];
  } catch (error) {
    console.error('Error generating bullet summary with AI:', error);
    // Provide fallback bullet points
    return [
      `Contract ID: ${documentId}`,
      `Effective date: ${contractSummary?.effectiveDate || 'Not specified'}`,
      `Term length: ${contractSummary?.termLength || 'Not specified'}`,
      `Contains ${clauses.length} clauses for analysis`,
      `Risk assessment needed for ${clauses.filter(c => c.compliance_status === 'Review Needed').length} clauses`
    ];
  }
}

/**
 * Extract all financial information from a contract using AI
 * @param text - The document text content
 * @returns Extracted financial details
 */
export async function extractFinancialsWithAI(text: string): Promise<{
  fees: Array<{name: string, amount: string, frequency?: string, description?: string, category?: string}>;
  paymentTerms: string[];
  rateCard: Array<{item: string, rate: string, unit?: string}>;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `You are an expert contract analyst specialized in extracting financial terms.
          Analyze the provided contract text and extract all financial information including:
          
          1. fees: Array of objects with name, amount, frequency (optional), description (optional), and category (optional)
          2. paymentTerms: Array of payment term strings
          3. rateCard: Array of objects with item, rate, and unit (optional)
          
          Respond with a JSON object containing these three arrays.`
        },
        {
          role: 'user',
          content: text.length > 15000 ? text.substring(0, 15000) + '...' : text
        }
      ],
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content in response');
    }
    
    const result = JSON.parse(content);
    return {
      fees: result.fees || [],
      paymentTerms: result.paymentTerms || [],
      rateCard: result.rateCard || []
    };
  } catch (error) {
    console.error('Error extracting financials with AI:', error);
    // Return empty arrays if AI fails
    return {
      fees: [],
      paymentTerms: [],
      rateCard: []
    };
  }
}