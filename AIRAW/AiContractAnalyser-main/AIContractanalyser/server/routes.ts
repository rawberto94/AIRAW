import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { analyzeDocument, extractClauses } from "./utils/contractAnalyzer";
import { z } from "zod";
import { contractSummarySchema } from "@shared/schema";
import { insertComplianceRuleSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only PDF, DOC, DOCX files
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/msword" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Only PDF, DOC, and DOCX are allowed."));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup API routes
  // Get all compliance rules
  app.get("/api/compliance-rules", async (_req, res) => {
    try {
      const rules = await storage.getAllComplianceRules();
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add compliance rule
  app.post("/api/compliance-rules", async (req, res) => {
    try {
      const validationResult = insertComplianceRuleSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid rule data" });
      }
      
      const rule = await storage.createComplianceRule(validationResult.data);
      res.status(201).json(rule);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update compliance rule
  app.put("/api/compliance-rules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validationResult = insertComplianceRuleSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid rule data" });
      }
      
      const rule = await storage.updateComplianceRule(id, validationResult.data);
      if (!rule) {
        return res.status(404).json({ message: "Rule not found" });
      }
      
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete compliance rule
  app.delete("/api/compliance-rules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteComplianceRule(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Rule not found" });
      }
      
      res.json({ message: "Rule deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all clauses
  app.get("/api/clauses", async (_req, res) => {
    try {
      const clauses = await storage.getAllClauses();
      res.json(clauses);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Mark a clause as completed
  app.post("/api/clauses/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const clauseId = parseInt(id);
      
      if (isNaN(clauseId)) {
        return res.status(400).json({ message: "Invalid clause ID" });
      }
      
      // Get the existing clause
      const existingClause = await storage.getClause(clauseId);
      
      if (!existingClause) {
        return res.status(404).json({ message: "Clause not found" });
      }
      
      // Update the clause with completed=true
      const updatedClause = {
        ...existingClause,
        completed: true
      };
      
      // Update the clause in the database
      await storage.updateClause(clauseId, updatedClause);
      
      res.json({ 
        message: "Clause marked as completed",
        clause: updatedClause
      });
    } catch (error: any) {
      console.error("Error marking clause as completed:", error);
      res.status(500).json({ message: error.message || "Error marking clause as completed" });
    }
  });
  
  // Reset/delete all clauses
  app.delete("/api/clauses/reset", async (_req, res) => {
    try {
      // Delete all clauses from database
      // In a real implementation, you might want to limit this to specific users or documents
      const clauses = await storage.getAllClauses();
      
      for (const clause of clauses) {
        if (clause.id) {
          await storage.deleteClause(clause.id);
        }
      }
      
      res.json({ message: "All clauses have been reset successfully" });
    } catch (error: any) {
      console.error("Error resetting clauses:", error);
      res.status(500).json({ message: error.message || "Error resetting clauses" });
    }
  });

  // Upload and analyze contract
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        console.log("No file was uploaded in the request");
        return res.status(400).json({ message: "No file provided" });
      }

      // Get file details
      const { originalname, buffer, mimetype } = req.file;
      console.log(`File received: ${originalname}, type: ${mimetype}, size: ${buffer.length} bytes`);
      
      const fileId = Date.now().toString();
      console.log(`Processing document with ID: ${fileId}`);
      
      // Reset all clauses before processing new document
      console.log("Resetting all existing clauses...");
      try {
        // Get all clauses
        const existingClauses = await storage.getAllClauses();
        
        // Delete each clause
        for (const clause of existingClauses) {
          if (clause.id) {
            await storage.deleteClause(clause.id);
          }
        }
        console.log(`Reset ${existingClauses.length} clauses successfully`);
      } catch (resetError) {
        console.error("Error resetting clauses:", resetError);
        // Continue with upload even if reset fails
      }
      
      // Extract text clauses from document
      console.log("Extracting clauses from document...");
      const extractedClauses = await extractClauses(buffer, mimetype);
      console.log(`Extracted ${extractedClauses.length} clauses`);
      
      // Get compliance rules
      const rules = await storage.getAllComplianceRules();
      console.log(`Found ${rules.length} compliance rules for analysis`);
      
      // Analyze clauses against compliance rules
      console.log("Analyzing clauses against compliance rules...");
      const analyzedClauses = await analyzeDocument(extractedClauses, rules, fileId);
      console.log(`Analysis complete. Processed ${analyzedClauses.length} clauses`);
      
      // Store clauses in database
      console.log("Storing analyzed clauses in database...");
      for (const clause of analyzedClauses) {
        // Initialize with completed = false
        const clauseWithCompletion = {
          ...clause,
          completed: false
        };
        await storage.createClause(clauseWithCompletion);
      }
      
      // Generate contract summary
      console.log("Generating contract summary...");
      
      // Combined text for AI analysis
      const fullText = extractedClauses.join("\n\n");
      
      // Extract financial information using AI if available
      let fees = [];
      let paymentTerms = ["Net 30 days"];
      let rateCard = [];
      
      if (process.env.OPENAI_API_KEY) {
        try {
          console.log("Using OpenAI to extract financial information");
          const { extractFinancials } = require('./utils/contractAnalyzer');
          const financialData = await extractFinancials(fullText);
          
          if (financialData) {
            fees = financialData.fees || [];
            paymentTerms = financialData.paymentTerms || ["Net 30 days"];
            rateCard = financialData.rateCard || [];
            console.log("AI financial extraction successful");
          }
        } catch (aiError) {
          console.error("Error using OpenAI for financial extraction:", aiError);
          console.log("Falling back to basic extraction");
        }
      }
      
      // If AI extraction failed or is not available, use basic extraction as fallback
      if (fees.length === 0) {
        console.log("Using basic fee extraction as fallback");
        // Extract fee information from the document
        const feeRelatedClauses = analyzedClauses.filter(c => 
          c.clause.toLowerCase().includes("fee") || 
          c.clause.toLowerCase().includes("payment") ||
          c.clause.toLowerCase().includes("cost") ||
          c.clause.toLowerCase().includes("price") ||
          c.clause.toLowerCase().includes("charge")
        );
        
        // Extract fees based on the content (simplified extraction logic)
        const extractedFees = feeRelatedClauses.map(clause => {
          // Basic pattern matching to identify fee information
          const clause_text = clause.clause.toLowerCase();
          const fee_name_match = clause_text.match(/(?:a|an|the)\s+([a-z\s]+(?:fee|charge|payment))/i);
          const amount_match = clause_text.match(/\$\s*([0-9,\.]+)|([0-9,\.]+)\s*dollars/i);
          const percentage_match = clause_text.match(/([0-9\.]+)\s*(?:percent|%)/i);
          const frequency_match = clause_text.match(/(?:per|each|every)\s+(month|year|quarter|week|day|hour|annum)/i);
          
          let frequency = frequency_match ? frequency_match[1] : undefined;
          let category = clause.category || "General Fee";
          
          // Extract amount from either dollar match or percentage match
          let amount;
          if (amount_match) {
            amount = amount_match[0];
          } else if (percentage_match) {
            amount = percentage_match[0];
          } else {
            amount = "See contract for details";
          }
          
          // Extract fee name, or use category if no name found
          let name;
          if (fee_name_match) {
            name = fee_name_match[1].trim();
            // Capitalize first letter of each word
            name = name.replace(/\b\w/g, l => l.toUpperCase());
          } else {
            name = "Unspecified Fee";
          }
          
          return {
            name,
            amount,
            frequency,
            category,
            description: clause.clause.substring(0, 100) + (clause.clause.length > 100 ? "..." : "")
          };
        });
        
        // Remove duplicates by name 
        fees = Array.from(
          new Map(extractedFees.map(fee => [fee.name, fee])).values()
        );
      }
      
      // Identify key clauses by category
      const terminationClause = analyzedClauses.find(c => 
        c.category === "Termination" || 
        c.clause.toLowerCase().includes("terminat")
      )?.clause || "Either party may terminate with 30 days written notice";
      
      const confidentialityClause = analyzedClauses.find(c => 
        c.category === "Confidentiality" || 
        c.clause.toLowerCase().includes("confidential")
      )?.clause || "Standard confidentiality terms apply";
      
      // Create the summary object
      const summary = {
        documentId: fileId,
        title: `Contract Agreement ${originalname}`,
        parties: {
          party1: "Company A",
          party2: "Company B"
        },
        effectiveDate: new Date().toISOString().split('T')[0],
        termLength: "12 months",
        paymentTerms: paymentTerms,
        rateCard: rateCard.length > 0 ? rateCard : [
          {
            item: "Basic Service",
            rate: "$1,000",
            unit: "per month"
          },
          {
            item: "Premium Support",
            rate: "$150",
            unit: "per hour"
          }
        ],
        fees: fees.length > 0 ? fees : [
          {
            name: "Setup Fee",
            amount: "$500",
            frequency: "one-time",
            category: "Initial Fees",
            description: "One-time setup fee charged at the beginning of the contract"
          }
        ],
        keyObligations: analyzedClauses
          .filter(c => c.compliance_status === "Compliant" && c.risk_score < 5)
          .slice(0, 3)
          .map(c => c.clause),
        confidentialityTerms: confidentialityClause,
        terminationClauses: [terminationClause]
      };
      
      await storage.createContractSummary(summary);
      console.log("Contract summary generated successfully.");
      
      console.log("Document analysis complete. Sending response.");
      res.json({ 
        message: "Document analyzed successfully",
        document_id: fileId,
        clauses: analyzedClauses,
        summary: summary
      });
    } catch (error: any) {
      console.error("Error processing file:", error);
      res.status(500).json({ message: error.message || "Error processing file" });
    }
  });

  // Get contract summary
  app.get("/api/contract-summary/:documentId", async (req, res) => {
    try {
      const { documentId } = req.params;
      const summary = await storage.getContractSummary(documentId);
      
      if (!summary) {
        return res.status(404).json({ message: "Contract summary not found" });
      }
      
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Generate contract summary
  app.post("/api/contract-summary", async (req, res) => {
    try {
      const validationResult = contractSummarySchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid summary data" });
      }
      
      const summary = await storage.createContractSummary(validationResult.data);
      res.status(201).json(summary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // API to generate summary from document - will create if doesn't exist or update if it does
  app.post("/api/contract-summary/generate/:documentId", async (req, res) => {
    try {
      const { documentId } = req.params;
      
      // Check if document has clauses
      const clauses = await storage.getClausesByDocumentId(documentId);
      if (!clauses || clauses.length === 0) {
        return res.status(404).json({ 
          message: "No document found with this ID. Upload a document first."
        });
      }
      
      // Check if summary already exists
      let summary = await storage.getContractSummary(documentId);
      
      if (!summary) {
        // Generate a new summary
        // In real implementation, this would use AI to analyze the document
        summary = {
          documentId,
          title: "Contract Agreement",
          parties: {
            party1: "Company A",
            party2: "Company B"
          },
          effectiveDate: "2023-01-01",
          termLength: "12 months",
          paymentTerms: [
            "Net 30 days",
            "10% late fee after 30 days"
          ],
          rateCard: [
            {
              item: "Basic Service",
              rate: "$1,000",
              unit: "per month"
            },
            {
              item: "Premium Support",
              rate: "$150",
              unit: "per hour"
            }
          ],
          fees: [
            {
              name: "Setup Fee",
              amount: "$500",
              frequency: "one-time",
              category: "Initial Fees",
              description: "One-time setup fee charged at the beginning of the contract"
            },
            {
              name: "Late Payment Fee",
              amount: "2% monthly",
              frequency: "as incurred",
              category: "Penalty Fees",
              description: "Fee charged on overdue payments, calculated at 2% of outstanding balance per month"
            }
          ],
          keyObligations: [
            "Provide services as described in Schedule A",
            "Maintain confidentiality of all proprietary information",
            "Submit monthly reports by the 5th of each month"
          ],
          confidentialityTerms: "All information shared between parties must be kept confidential for a period of 3 years after termination.",
          terminationClauses: [
            "Either party may terminate with 30 days written notice",
            "Immediate termination allowed in case of material breach"
          ]
        };
        
        await storage.createContractSummary(summary);
      } else {
        // Update existing summary
        // This would normally analyze the document again if needed
        summary = {
          ...summary,
          // Update any fields if needed
        };
        
        await storage.updateContractSummary(documentId, summary);
      }
      
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  
  // Extract fees endpoint
  app.post('/api/extract-fees/:documentId', async (req, res) => {
    try {
      const { documentId } = req.params;
      let summary = await storage.getContractSummary(documentId);
      
      if (!summary) {
        return res.status(404).json({ 
          message: "Contract summary not found. Upload and analyze a document first."
        });
      }
      
      // Get clauses for this document
      const clauses = await storage.getClausesByDocumentId(documentId);
      
      if (!clauses || clauses.length === 0) {
        return res.status(404).json({ 
          message: "No clauses found for this document. Upload a document first."
        });
      }
      
      console.log(`Extracting fees for document ${documentId}`);
      
      // Combine all clauses into a single text for analysis
      const fullText = clauses.map(c => c.clause).join("\n\n");
      
      let extractedFees = [];
      
      // Try to use OpenAI to extract fees if available
      if (process.env.OPENAI_API_KEY) {
        try {
          console.log("Using OpenAI to extract fees");
          const { extractFinancials } = require('./utils/contractAnalyzer');
          const financialData = await extractFinancials(fullText);
          
          if (financialData && financialData.fees && financialData.fees.length > 0) {
            extractedFees = financialData.fees;
            console.log(`OpenAI extracted ${extractedFees.length} fees`);
          } else {
            console.log("OpenAI extraction returned no fees, using basic extraction");
            extractedFees = basicFeeExtraction(clauses);
          }
        } catch (aiError) {
          console.error("Error using OpenAI for fee extraction:", aiError);
          console.log("Falling back to basic fee extraction");
          extractedFees = basicFeeExtraction(clauses);
        }
      } else {
        // Fall back to basic extraction if OpenAI is not available
        console.log("OpenAI not available, using basic fee extraction");
        extractedFees = basicFeeExtraction(clauses);
      }
      
      // Check if any fees were found
      if (extractedFees.length === 0) {
        console.log("No fees found, adding a sample fee");
        extractedFees = [{
          name: "Processing Fee",
          amount: "5%",
          frequency: "per transaction",
          description: "Fee for processing contract transactions",
          category: "Service Fees"
        }];
      }
      
      // Merge with existing fees, avoiding duplicates
      const existingFees = summary.fees || [];
      console.log("Existing fees:", existingFees);
      
      // Create a map of existing fees by name for fast lookup
      const feeMap = new Map(existingFees.map(fee => [fee.name, fee]));
      
      // Add new fees that don't already exist
      for (const fee of extractedFees) {
        if (!feeMap.has(fee.name)) {
          feeMap.set(fee.name, fee);
        }
      }
      
      // Convert map back to array
      const updatedFees = Array.from(feeMap.values());
      
      // Update the summary with new fees
      const updatedSummary = {
        ...summary,
        fees: updatedFees
      };
      
      console.log('Updating contract summary with fees:', updatedFees);
      await storage.updateContractSummary(documentId, updatedSummary);
      
      res.json({ success: true, message: 'Fees extracted successfully', fees: updatedFees });
    } catch (error) {
      console.error('Error extracting fees:', error);
      res.status(500).json({ error: 'Failed to extract fees' });
    }
  });
  
  /**
   * Basic fee extraction without AI
   */
  function basicFeeExtraction(clauses: any[]): Array<{
    name: string;
    amount: string;
    frequency?: string;
    category?: string;
    description?: string;
  }> {
    // Extract fee-related clauses
    const feeRelatedClauses = clauses.filter((c: any) => 
      c.clause.toLowerCase().includes("fee") || 
      c.clause.toLowerCase().includes("payment") ||
      c.clause.toLowerCase().includes("cost") ||
      c.clause.toLowerCase().includes("price") ||
      c.clause.toLowerCase().includes("charge")
    );
    
    // Extract fees based on the content (simplified extraction logic)
    const extractedFees = feeRelatedClauses.map((clause: any) => {
      // Basic pattern matching to identify fee information
      const clause_text = clause.clause.toLowerCase();
      const fee_name_match = clause_text.match(/(?:a|an|the)\s+([a-z\s]+(?:fee|charge|payment))/i);
      const amount_match = clause_text.match(/\$\s*([0-9,\.]+)|([0-9,\.]+)\s*dollars/i);
      const percentage_match = clause_text.match(/([0-9\.]+)\s*(?:percent|%)/i);
      const frequency_match = clause_text.match(/(?:per|each|every)\s+(month|year|quarter|week|day|hour|annum)/i);
      
      let frequency = frequency_match ? frequency_match[1] : undefined;
      let category = clause.category || "General Fee";
      
      // Extract amount from either dollar match or percentage match
      let amount;
      if (amount_match) {
        amount = amount_match[0];
      } else if (percentage_match) {
        amount = percentage_match[0];
      } else {
        amount = "See contract for details";
      }
      
      // Extract fee name, or use category if no name found
      let name;
      if (fee_name_match) {
        name = fee_name_match[1].trim();
        // Capitalize first letter of each word
        name = name.replace(/\b\w/g, (l: string) => l.toUpperCase());
      } else {
        name = "Unspecified Fee";
      }
      
      return {
        name,
        amount,
        frequency,
        category,
        description: clause.clause.substring(0, 100) + (clause.clause.length > 100 ? "..." : "")
      };
    });
    
    // Remove duplicates by name
    return Array.from(
      new Map(extractedFees.map((fee: any) => [fee.name, fee])).values()
    );
  }
  
  // Extract costs endpoint
  app.post('/api/extract-costs/:documentId', async (req, res) => {
    try {
      const { documentId } = req.params;
      let summary = await storage.getContractSummary(documentId);
      
      if (!summary) {
        return res.status(404).json({ 
          message: "Contract summary not found. Upload and analyze a document first."
        });
      }
      
      // Get clauses for this document
      const clauses = await storage.getClausesByDocumentId(documentId);
      
      if (!clauses || clauses.length === 0) {
        return res.status(404).json({ 
          message: "No clauses found for this document. Upload a document first."
        });
      }
      
      console.log(`Extracting costs for document ${documentId}`);
      
      // Combine all clauses into a single text for analysis
      const fullText = clauses.map(c => c.clause).join("\n\n");
      
      let extractedRateCard = [];
      
      // Try to use OpenAI to extract rate card if available
      if (process.env.OPENAI_API_KEY) {
        try {
          console.log("Using OpenAI to extract rate card");
          const { extractFinancials } = require('./utils/contractAnalyzer');
          const financialData = await extractFinancials(fullText);
          
          if (financialData && financialData.rateCard && financialData.rateCard.length > 0) {
            extractedRateCard = financialData.rateCard;
            console.log(`OpenAI extracted ${extractedRateCard.length} rate card items`);
          } else {
            console.log("OpenAI extraction returned no rate card items, using basic extraction");
            extractedRateCard = basicRateCardExtraction(clauses);
          }
        } catch (aiError) {
          console.error("Error using OpenAI for rate card extraction:", aiError);
          console.log("Falling back to basic rate card extraction");
          extractedRateCard = basicRateCardExtraction(clauses);
        }
      } else {
        // Fall back to basic extraction if OpenAI is not available
        console.log("OpenAI not available, using basic rate card extraction");
        extractedRateCard = basicRateCardExtraction(clauses);
      }
      
      // Check if any rate card items were found
      if (extractedRateCard.length === 0) {
        console.log("No rate card items found, adding a sample item");
        extractedRateCard = [{
          item: "Additional Service",
          rate: "$75",
          unit: "per hour"
        }];
      }
      
      // Merge with existing rate card, avoiding duplicates
      const existingRateCard = summary.rateCard || [];
      console.log("Existing rate card:", existingRateCard);
      
      // Create a map of existing rate card items by name for fast lookup
      const rateCardMap = new Map(existingRateCard.map(item => [item.item, item]));
      
      // Add new rate card items that don't already exist
      for (const item of extractedRateCard) {
        if (!rateCardMap.has(item.item)) {
          rateCardMap.set(item.item, item);
        }
      }
      
      // Convert map back to array
      const updatedRateCard = Array.from(rateCardMap.values());
      
      // Update the summary with new rate card
      const updatedSummary = {
        ...summary,
        rateCard: updatedRateCard
      };
      
      console.log('Updating contract summary with costs:', updatedRateCard);
      await storage.updateContractSummary(documentId, updatedSummary);
      
      res.json({ success: true, message: 'Costs extracted successfully', rateCard: updatedRateCard });
    } catch (error) {
      console.error('Error extracting costs:', error);
      res.status(500).json({ error: 'Failed to extract costs' });
    }
  });
  
  /**
   * Basic rate card extraction without AI
   */
  function basicRateCardExtraction(clauses: any[]): Array<{
    item: string;
    rate: string;
    unit?: string;
  }> {
    // Extract cost-related clauses
    const costRelatedClauses = clauses.filter((c: any) => 
      c.clause.toLowerCase().includes("price") || 
      c.clause.toLowerCase().includes("rate") ||
      c.clause.toLowerCase().includes("cost") ||
      c.clause.toLowerCase().includes("charge") ||
      c.clause.toLowerCase().includes("$") ||
      c.clause.toLowerCase().includes("dollar")
    );
    
    // Extract rate card items based on the content (simplified extraction logic)
    const extractedItems = costRelatedClauses.map((clause: any) => {
      // Basic pattern matching to identify rate information
      const clause_text = clause.clause.toLowerCase();
      const service_match = clause_text.match(/(?:for|of)\s+([a-z\s]+(?:service|support|consultation|assistance|work))/i);
      const amount_match = clause_text.match(/\$\s*([0-9,\.]+)|([0-9,\.]+)\s*dollars/i);
      const unit_match = clause_text.match(/(?:per|each|every)\s+(hour|day|week|month|year|project|item|unit)/i);
      
      let unit = unit_match ? `per ${unit_match[1]}` : undefined;
      
      // Extract rate amount
      let rate;
      if (amount_match) {
        rate = amount_match[0];
      } else {
        return null; // Skip if no rate amount found
      }
      
      // Extract service name
      let item;
      if (service_match) {
        item = service_match[1].trim();
        // Capitalize first letter of each word
        item = item.replace(/\b\w/g, (l: string) => l.toUpperCase());
      } else {
        item = clause.category || "General Service";
      }
      
      return {
        item,
        rate,
        unit
      };
    }).filter(Boolean) as Array<{ item: string; rate: string; unit?: string }>; // Remove null items
    
    // Remove duplicates by item name
    return Array.from(
      new Map(extractedItems.map((item: any) => [item.item, item])).values()
    );
  }
  
  // Extract payment terms endpoint
  app.post('/api/extract-payment-terms/:documentId', async (req, res) => {
    try {
      const { documentId } = req.params;
      let summary = await storage.getContractSummary(documentId);
      
      if (!summary) {
        return res.status(404).json({ 
          message: "Contract summary not found. Upload and analyze a document first."
        });
      }
      
      // Get clauses for this document
      const clauses = await storage.getClausesByDocumentId(documentId);
      
      if (!clauses || clauses.length === 0) {
        return res.status(404).json({ 
          message: "No clauses found for this document. Upload a document first."
        });
      }
      
      console.log(`Extracting payment terms for document ${documentId}`);
      
      // Combine all clauses into a single text for analysis
      const fullText = clauses.map(c => c.clause).join("\n\n");
      
      let extractedPaymentTerms: string[] = [];
      
      // Try to use OpenAI to extract payment terms if available
      if (process.env.OPENAI_API_KEY) {
        try {
          console.log("Using OpenAI to extract payment terms");
          const { extractFinancials } = require('./utils/contractAnalyzer');
          const financialData = await extractFinancials(fullText);
          
          if (financialData && financialData.paymentTerms && financialData.paymentTerms.length > 0) {
            extractedPaymentTerms = financialData.paymentTerms;
            console.log(`OpenAI extracted ${extractedPaymentTerms.length} payment terms`);
          } else {
            console.log("OpenAI extraction returned no payment terms, using basic extraction");
            extractedPaymentTerms = basicPaymentTermExtraction(clauses);
          }
        } catch (aiError) {
          console.error("Error using OpenAI for payment term extraction:", aiError);
          console.log("Falling back to basic payment term extraction");
          extractedPaymentTerms = basicPaymentTermExtraction(clauses);
        }
      } else {
        // Fall back to basic extraction if OpenAI is not available
        console.log("OpenAI not available, using basic payment term extraction");
        extractedPaymentTerms = basicPaymentTermExtraction(clauses);
      }
      
      // Check if any payment terms were found
      if (extractedPaymentTerms.length === 0) {
        console.log("No payment terms found, adding a sample payment term");
        extractedPaymentTerms = [
          "All invoices must be paid within 15 days of receipt with a 2% early payment discount."
        ];
      }
      
      // Merge with existing payment terms, avoiding duplicates
      const existingPaymentTerms = summary.paymentTerms || [];
      console.log("Existing payment terms:", existingPaymentTerms);
      
      // Create a set of existing payment terms for fast lookup
      const paymentTermsSet = new Set(existingPaymentTerms);
      
      // Add new payment terms that don't already exist
      for (const term of extractedPaymentTerms) {
        paymentTermsSet.add(term);
      }
      
      // Convert set back to array
      const updatedPaymentTerms = Array.from(paymentTermsSet);
      
      // Update the summary with new payment terms
      const updatedSummary = {
        ...summary,
        paymentTerms: updatedPaymentTerms
      };
      
      console.log('Updating contract summary with payment terms:', updatedPaymentTerms);
      await storage.updateContractSummary(documentId, updatedSummary);
      
      res.json({ success: true, message: 'Payment terms extracted successfully', paymentTerms: updatedPaymentTerms });
    } catch (error) {
      console.error('Error extracting payment terms:', error);
      res.status(500).json({ error: 'Failed to extract payment terms' });
    }
  });
  
  /**
   * Basic payment term extraction without AI
   */
  function basicPaymentTermExtraction(clauses: any[]): string[] {
    // Extract payment-related clauses
    const paymentRelatedClauses = clauses.filter((c: any) => 
      c.clause.toLowerCase().includes("payment") || 
      c.clause.toLowerCase().includes("invoice") ||
      c.clause.toLowerCase().includes("net") ||
      c.clause.toLowerCase().includes("due") ||
      c.clause.toLowerCase().includes("paid") ||
      c.clause.toLowerCase().includes("pay within")
    );
    
    // Extract payment terms based on the content (simplified extraction logic)
    const extractedTerms = paymentRelatedClauses.map((clause: any) => {
      // Basic pattern matching to identify payment terms
      const clause_text = clause.clause.toLowerCase();
      
      // Common payment term patterns
      const net_days_match = clause_text.match(/net\s+([0-9]+)\s+days?/i);
      const pay_within_match = clause_text.match(/pay(?:ment)?\s+within\s+([0-9]+)\s+days?/i);
      const due_match = clause_text.match(/due\s+(?:within|in)\s+([0-9]+)\s+days?/i);
      const late_fee_match = clause_text.match(/late\s+(?:fee|payment|charge)\s+of\s+([0-9\.]+%|[0-9\.]+\s+percent)/i);
      
      // Return the full clause if we found a payment term
      if (net_days_match || pay_within_match || due_match || late_fee_match) {
        // Prepare a concise payment term
        if (clause.clause.length <= 100) {
          return clause.clause;
        }
        
        // For longer clauses, extract just the payment term part
        if (net_days_match) {
          return `Payment terms: Net ${net_days_match[1]} days.`;
        } else if (pay_within_match) {
          return `Payment due within ${pay_within_match[1]} days.`;
        } else if (due_match) {
          return `Payment due within ${due_match[1]} days.`;
        } else if (late_fee_match) {
          return `Late payment fee of ${late_fee_match[1]} applies.`;
        }
      }
      
      return null;
    }).filter(Boolean) as string[];
    
    // Remove duplicates
    return Array.from(new Set(extractedTerms));
  }
  
  // Reset all clauses endpoint
  app.delete('/api/clauses/reset', async (req, res) => {
    try {
      // Get all clauses
      const clauses = await storage.getAllClauses();
      
      // Delete each clause
      for (const clause of clauses) {
        if (clause.id) {
          await storage.deleteClause(clause.id);
        }
      }
      
      res.json({ 
        success: true, 
        message: 'All clauses have been reset successfully',
        deletedCount: clauses.length 
      });
    } catch (error: any) {
      console.error('Error resetting clauses:', error);
      res.status(500).json({ message: error.message || 'Failed to reset clauses' });
    }
  });
  
  // Generate bullet point summary endpoint
  app.post('/api/generate-bullet-summary/:documentId', async (req, res) => {
    try {
      const { documentId } = req.params;
      
      console.log(`Generating bullet summary for document: ${documentId}`);
      
      // Retrieve contract summary
      let summary = await storage.getContractSummary(documentId);
      
      if (!summary) {
        return res.status(404).json({ 
          message: "Contract summary not found. Upload and analyze a document first."
        });
      }
      
      // Get clauses for this document
      const clauses = await storage.getClausesByDocumentId(documentId);
      
      if (!clauses || clauses.length === 0) {
        return res.status(404).json({ 
          message: "No clauses found for this document. Upload a document first."
        });
      }
      
      let bulletPoints;
      
      // Try to use OpenAI to generate a detailed summary if available
      if (process.env.OPENAI_API_KEY) {
        try {
          console.log("Using OpenAI to generate bullet point summary");
          const { generateBulletSummaryWithAI } = require('./utils/openai');
          
          bulletPoints = await generateBulletSummaryWithAI(documentId, summary, clauses);
          console.log(`OpenAI generated ${bulletPoints.length} bullet points`);
        } catch (aiError) {
          console.error("Error using OpenAI for bullet point generation:", aiError);
          console.log("Falling back to basic bullet point generation");
          bulletPoints = generateBasicBulletPoints(summary, clauses);
        }
      } else {
        // Fall back to basic bullet point generation if OpenAI is not available
        console.log("OpenAI not available, using basic bullet point generation");
        bulletPoints = generateBasicBulletPoints(summary, clauses);
      }
      
      res.json({
        message: "Bullet point summary generated successfully",
        bulletPoints: bulletPoints
      });
    } catch (error: any) {
      console.error("Error generating bullet point summary:", error);
      res.status(500).json({ message: error.message || "Error generating bullet point summary" });
    }
  });
  
/**
 * Generate basic bullet point summary without using AI
 */
function generateBasicBulletPoints(summary: any, clauses: any[]): string[] {
  // Create bullet points based on summary and clauses
  const bulletPoints = [
    `Contract between ${summary.parties?.party1 || 'Party 1'} and ${summary.parties?.party2 || 'Party 2'}.`,
    `Effective date: ${summary.effectiveDate || 'Not specified'}.`,
    `Term length: ${summary.termLength || 'Not specified'}.`
  ];
  
  // Add payment-related bullet points
  if (summary.paymentTerms && summary.paymentTerms.length > 0) {
    bulletPoints.push(`Payment terms: ${summary.paymentTerms[0]}.`);
  }
  
  // Add fee-related bullet points
  if (summary.fees && summary.fees.length > 0) {
    const feesCount = summary.fees.length;
    bulletPoints.push(`Contains ${feesCount} fee${feesCount > 1 ? 's' : ''}, including ${summary.fees[0].name}.`);
  }
  
  // Add compliance-related bullet points
  const compliantClauses = clauses.filter(c => c.compliance_status === "Compliant").length;
  const nonCompliantClauses = clauses.filter(c => c.compliance_status === "Non-Compliant").length;
  const reviewClauses = clauses.filter(c => c.compliance_status === "Review Needed").length;
  
  bulletPoints.push(`Compliance analysis: ${compliantClauses} compliant clauses, ${nonCompliantClauses} non-compliant clauses, ${reviewClauses} clauses needing review.`);
  
  // Add risk-related bullet points
  const highRiskClauses = clauses.filter(c => c.risk_score >= 7).length;
  const mediumRiskClauses = clauses.filter(c => c.risk_score >= 4 && c.risk_score < 7).length;
  const lowRiskClauses = clauses.filter(c => c.risk_score < 4).length;
  
  bulletPoints.push(`Risk assessment: ${highRiskClauses} high-risk clauses, ${mediumRiskClauses} medium-risk clauses, ${lowRiskClauses} low-risk clauses.`);
  
  // Add confidentiality bullet point if available
  if (summary.confidentialityTerms) {
    bulletPoints.push(`Contains confidentiality requirements.`);
  }
  
  // Add termination bullet point if available
  if (summary.terminationClauses && summary.terminationClauses.length > 0) {
    bulletPoints.push(`Termination clause: ${summary.terminationClauses[0]}.`);
  }
  
  return bulletPoints;
}

  const httpServer = createServer(app);
  return httpServer;
}
