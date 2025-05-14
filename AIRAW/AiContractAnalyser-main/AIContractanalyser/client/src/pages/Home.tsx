import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { ClauseType, ComplianceRuleType } from "@/types";
import FileUploader from "@/components/FileUploader";
import ComplianceRules from "@/components/ComplianceRules";
import ClauseResults from "@/components/ClauseResults";
import ClauseDetailModal from "@/components/ClauseDetailModal";
import ContractSummary, { ContractSummaryProps } from "@/components/ContractSummary";
import BulletSummary from "@/components/BulletSummary";
import ResetClausesButton from "@/components/ResetClausesButton";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [selectedClause, setSelectedClause] = useState<ClauseType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { toast } = useToast();

  // Fetch compliance rules
  const { data: rules = [] } = useQuery<ComplianceRuleType[]>({
    queryKey: ["/api/compliance-rules"],
  });

  // Fetch clauses if they exist
  const { data: clauses = [], isLoading: isClausesLoading } = useQuery<ClauseType[]>({
    queryKey: ["/api/clauses"],
  });
  
  // State to track the current document ID
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(null);
  
  // Fetch contract summary if a document is selected
  const { data: contractSummary, isLoading: isSummaryLoading } = useQuery<ContractSummaryProps['summary']>({
    queryKey: ["/api/contract-summary", currentDocumentId],
    queryFn: async () => {
      if (!currentDocumentId) {
        // Return an empty contract summary object
        return {
          documentId: "",
          fees: [],
          paymentTerms: [],
          rateCard: [],
          keyObligations: [],
          terminationClauses: []
        } as ContractSummaryProps['summary'];
      }
      
      console.log("Fetching contract summary for document:", currentDocumentId);
      
      try {
        // Use fetch directly instead of apiRequest
        const response = await fetch(`/api/contract-summary/${currentDocumentId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch contract summary: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Contract summary API response:", data);
        
        // Handle the case where the API returns an empty object
        if (!data || Object.keys(data).length === 0) {
          console.log("No summary data available for this document");
          // Return an empty object with expected structure
          return {
            documentId: currentDocumentId,
            fees: [],
            paymentTerms: [],
            rateCard: [],
            keyObligations: [],
            terminationClauses: []
          } as ContractSummaryProps['summary'];
        }
        
        // Process the response to ensure all arrays are defined
        const processedResponse = {
          ...data,
          documentId: data.documentId || currentDocumentId,
          fees: Array.isArray(data.fees) ? data.fees : [],
          paymentTerms: Array.isArray(data.paymentTerms) ? data.paymentTerms : [],
          rateCard: Array.isArray(data.rateCard) ? data.rateCard : [],
          keyObligations: Array.isArray(data.keyObligations) ? data.keyObligations : [],
          terminationClauses: Array.isArray(data.terminationClauses) ? data.terminationClauses : [],
        };
        
        // Log fee information for debugging
        if (processedResponse.fees && processedResponse.fees.length > 0) {
          console.log("Fees found in summary:", processedResponse.fees);
        } else {
          console.log("No fees found in summary");
        }
        
        return processedResponse as ContractSummaryProps['summary'];
      } catch (error) {
        console.error("Error fetching contract summary:", error);
        // Return an empty object with expected structure
        return {
          documentId: currentDocumentId,
          fees: [],
          paymentTerms: [],
          rateCard: [],
          keyObligations: [],
          terminationClauses: []
        } as ContractSummaryProps['summary'];
      }
    },
    enabled: !!currentDocumentId, // Only run query if we have a document ID
    // Refetch on specific intervals to get updates from extraction endpoints
    refetchInterval: 3000, // Refetch every 3 seconds when the component is mounted
    refetchIntervalInBackground: false, // Only refetch when tab is in foreground
  });

  // Add rule mutation
  const addRuleMutation = useMutation({
    mutationFn: async (rule: ComplianceRuleType) => {
      await apiRequest("POST", "/api/compliance-rules", rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance-rules"] });
      toast({
        title: "Rule added",
        description: "New compliance rule has been added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: async (rule: ComplianceRuleType) => {
      await apiRequest("PUT", `/api/compliance-rules/${rule.id}`, rule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance-rules"] });
      toast({
        title: "Rule updated",
        description: "Compliance rule has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: number) => {
      await apiRequest("DELETE", `/api/compliance-rules/${ruleId}`, null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/compliance-rules"] });
      toast({
        title: "Rule deleted",
        description: "Compliance rule has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Upload contract mutation
  const uploadContractMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      console.log("Starting file upload mutation");
      
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header for FormData, browser will set it with boundary
        credentials: "include",
      });
      
      console.log("Upload response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload error:", errorText);
        throw new Error(errorText || response.statusText);
      }
      
      const result = await response.json();
      console.log("Upload success, received clauses:", result.clauses?.length || 0);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/clauses"] });
      
      // Set current document ID to trigger summary fetching
      if (data && data.document_id) {
        setCurrentDocumentId(data.document_id);
        queryClient.invalidateQueries({ queryKey: ["/api/contract-summary", data.document_id] });
      }
      
      toast({
        title: "Contract analyzed",
        description: "Contract has been uploaded and analyzed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error analyzing contract",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddRule = () => {
    const newRule = { keyword: "", allowed: true };
    addRuleMutation.mutate(newRule);
  };

  const handleUpdateRule = (rule: ComplianceRuleType) => {
    updateRuleMutation.mutate(rule);
  };

  const handleDeleteRule = (ruleId: number) => {
    deleteRuleMutation.mutate(ruleId);
  };

  const handleUploadContract = (file: File) => {
    console.log("Uploading file:", file.name);
    
    // Clear existing clauses before starting new analysis
    queryClient.setQueryData(["/api/clauses"], []);
    
    const formData = new FormData();
    formData.append("file", file);
    
    // Log the FormData content to verify
    console.log("FormData created with file:", file.name, file.type, file.size);
    
    uploadContractMutation.mutate(formData);
  };

  const handleOpenClauseDetails = (clause: ClauseType) => {
    setSelectedClause(clause);
    setIsDetailModalOpen(true);
  };

  const handleCloseClauseDetails = () => {
    setIsDetailModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <header className="mb-8 p-5 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-9 w-9 text-primary mr-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <line x1="10" y1="9" x2="8" y2="9"></line>
              </svg>
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 bg-gradient-to-r from-primary to-blue-700 inline-block text-transparent bg-clip-text">
                  AI Contract Management
                </h1>
                <p className="text-neutral-500 text-sm">
                  Analyze and manage contract compliance with AI
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="bg-white/90 text-neutral-700 px-3 py-2 rounded-lg shadow-sm border border-neutral-200 flex items-center space-x-2 hover:bg-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span>Help</span>
              </button>
              <button className="bg-gradient-to-r from-primary to-blue-700 text-white px-3 py-2 rounded-lg shadow-sm flex items-center space-x-2 hover:from-primary-dark hover:to-blue-800 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span>Settings</span>
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - Upload and Rules */}
          <div className="lg:col-span-4 space-y-6">
            <FileUploader 
              onUpload={handleUploadContract} 
              isLoading={uploadContractMutation.isPending} 
            />
            
            <ComplianceRules 
              rules={rules} 
              onAddRule={handleAddRule} 
              onUpdateRule={handleUpdateRule}
              onDeleteRule={handleDeleteRule}
              isLoading={addRuleMutation.isPending || updateRuleMutation.isPending || deleteRuleMutation.isPending}
            />
          </div>
          
          {/* Right column - Extracted Clauses and Summary */}
          <div className="lg:col-span-8 space-y-6">
            {/* Contract Summary Section (conditionally displayed) */}
            {currentDocumentId && (
              <>
                <ContractSummary 
                  documentId={currentDocumentId}
                  isLoading={isSummaryLoading}
                  summary={contractSummary}
                />
                
                {/* Bullet Summary */}
                <BulletSummary documentId={currentDocumentId} />
              </>
            )}
            
            {/* Clauses Section with Reset Button */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-neutral-800">Analyzed Clauses</h3>
                {clauses.length > 0 && <ResetClausesButton />}
              </div>
              
              <ClauseResults 
                clauses={clauses} 
                isLoading={isClausesLoading || uploadContractMutation.isPending}
                onViewDetails={handleOpenClauseDetails}
              />
            </div>
          </div>
        </div>
        
        {/* Clause detail modal */}
        {selectedClause && (
          <ClauseDetailModal 
            isOpen={isDetailModalOpen} 
            clause={selectedClause}
            onClose={handleCloseClauseDetails}
          />
        )}
        
        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-neutral-500">
          <p>
            AI Contract Analyzer © {new Date().getFullYear()} • 
            <span className="ml-1">Analyze contract documents with AI and check compliance against custom rules</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
