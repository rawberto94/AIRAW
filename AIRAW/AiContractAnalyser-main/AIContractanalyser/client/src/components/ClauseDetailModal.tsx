import React from 'react';
import { ClauseType, ComplianceIssue, Recommendation } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ClauseDetailModalProps {
  isOpen: boolean;
  clause: ClauseType;
  onClose: () => void;
}

const ClauseDetailModal: React.FC<ClauseDetailModalProps> = ({ isOpen, clause, onClose }) => {
  // Helper to determine risk level text and color
  const getRiskData = (score: number) => {
    if (score >= 7) {
      return {
        level: 'High Risk',
        textClass: 'text-risk-high',
        bgClass: 'bg-risk-high',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-risk-high mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )
      };
    } else if (score >= 4) {
      return {
        level: 'Medium Risk',
        textClass: 'text-risk-medium',
        bgClass: 'bg-risk-medium',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-risk-medium mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        )
      };
    } else {
      return {
        level: 'Low Risk',
        textClass: 'text-risk-low',
        bgClass: 'bg-risk-low',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-risk-low mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        )
      };
    }
  };

  // Format risk score for display
  const formattedRiskScore = (clause.risk_score / 10).toFixed(1);
  const riskData = getRiskData(clause.risk_score);
  const riskPercentage = (clause.risk_score * 10);
  
  // Sample recommendations and issues based on clause content
  // In a real app, these would come from the backend analysis
  const getRecommendations = (): Recommendation[] => {
    if (clause.risk_score >= 7) {
      return [
        {
          title: "Limit the scope of liability exclusions",
          description: "Specify particular scenarios instead of blanket exclusions"
        },
        {
          title: "Add carve-outs for statutory liability",
          description: "Retain liability for matters that cannot legally be excluded"
        },
        {
          title: "Consider liability caps",
          description: "Instead of exclusions, set reasonable financial limits"
        }
      ];
    } else if (clause.risk_score >= 4) {
      return [
        {
          title: "Clarify intellectual property ownership",
          description: "Specify what happens to existing IP versus new IP"
        },
        {
          title: "Consider joint ownership provisions",
          description: "For collaborative work, define shared rights arrangements"
        }
      ];
    } else {
      return [
        {
          title: "Extend confidentiality period",
          description: "Consider longer protection periods for sensitive information"
        }
      ];
    }
  };

  const getComplianceIssues = (): ComplianceIssue[] => {
    if (clause.compliance_status === 'Non-Compliant') {
      return [
        {
          issue: "Liability limitation",
          rule: "Liability clause (Not Allowed)",
          description: "Conflicts with compliance rule that prohibits liability limitations"
        },
        {
          issue: "Overly broad exemptions",
          description: "Conflicts with standard compliance requirements"
        }
      ];
    } else if (clause.compliance_status === 'Review Needed') {
      return [
        {
          issue: "Ambiguous ownership terms",
          description: "Needs clarification on intellectual property assignment"
        }
      ];
    } else {
      return [];
    }
  };

  const recommendations = clause.recommendations || getRecommendations();
  const complianceIssues = clause.compliance_issues || getComplianceIssues();

  // Generate risk description based on score
  const getRiskDescription = () => {
    if (clause.risk_score >= 7) {
      return "This clause presents significant risk due to the broad liability limitations and potential regulatory concerns.";
    } else if (clause.risk_score >= 4) {
      return "This clause contains moderate risk elements that should be reviewed by legal counsel.";
    } else {
      return "This clause presents minimal risk and follows standard contract practices.";
    }
  };

  const handleExportDetails = () => {
    // In a real implementation, this would generate a report
    // For now, just close the modal
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium">Clause Details</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-6">
          <div>
            <div className="flex items-center mb-4">
              {riskData.icon}
              <h4 className="font-medium text-lg">Risk Assessment</h4>
            </div>
            <div className="bg-neutral-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-neutral-700">Risk Score</span>
                <span className={`font-medium ${riskData.textClass}`}>{formattedRiskScore}/10</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2.5 mb-4">
                <div className={`${riskData.bgClass} h-2.5 rounded-full`} style={{ width: `${riskPercentage}%` }}></div>
              </div>
              <p className="text-neutral-700 text-sm">{getRiskDescription()}</p>
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h4 className="font-medium text-lg">Compliance Analysis</h4>
            </div>
            <div className="bg-neutral-50 p-4 rounded-md">
              <div className="flex items-center mb-3">
                <div className={`px-3 py-1 rounded-full text-sm ${
                  clause.compliance_status === 'Compliant' 
                    ? 'bg-risk-low/10 text-risk-low' 
                    : clause.compliance_status === 'Non-Compliant'
                      ? 'bg-risk-high/10 text-risk-high'
                      : 'bg-risk-medium/10 text-risk-medium'
                }`}>
                  {clause.compliance_status}
                </div>
              </div>
              
              {complianceIssues.length > 0 ? (
                <ul className="space-y-3">
                  {complianceIssues.map((issue, index) => (
                    <li key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-risk-high mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                      <div>
                        <p className="text-neutral-800 font-medium">{issue.issue}</p>
                        <p className="text-neutral-600 text-sm">
                          {issue.rule ? `Conflicts with rule: "${issue.rule}"` : issue.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-neutral-600">No compliance issues detected.</p>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-700 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <h4 className="font-medium text-lg">Clause Text</h4>
            </div>
            <div className="bg-neutral-50 p-4 rounded-md">
              <p className="text-neutral-800">{clause.clause}</p>
              <div className="mt-3 pt-3 border-t border-neutral-200">
                <div className="flex flex-wrap gap-2">
                  {clause.section && (
                    <div className="px-2 py-1 rounded-md text-xs bg-neutral-100 text-neutral-700">
                      Section {clause.section}
                    </div>
                  )}
                  {clause.category && (
                    <div className="px-2 py-1 rounded-md text-xs bg-neutral-100 text-neutral-700">
                      {clause.category}
                    </div>
                  )}
                  {clause.page && (
                    <div className="px-2 py-1 rounded-md text-xs bg-neutral-100 text-neutral-700">
                      Page {clause.page}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-700 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
              <h4 className="font-medium text-lg">Recommendations</h4>
            </div>
            <div className="bg-neutral-50 p-4 rounded-md">
              {recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                      </svg>
                      <div>
                        <p className="text-neutral-800 font-medium">{recommendation.title}</p>
                        <p className="text-neutral-600 text-sm">{recommendation.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-neutral-600">No recommendations needed for this low-risk clause.</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleExportDetails}>
            Export Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClauseDetailModal;
