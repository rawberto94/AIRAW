import React, { useState } from 'react';
import { ComplianceRuleType } from '@/types';

interface ComplianceRulesProps {
  rules: ComplianceRuleType[];
  onAddRule: () => void;
  onUpdateRule: (rule: ComplianceRuleType) => void;
  onDeleteRule: (ruleId: number) => void;
  isLoading: boolean;
}

// Predefined categories for compliance rules
const RULE_CATEGORIES = [
  "Payment Terms",
  "Liability",
  "Confidentiality",
  "Termination",
  "Intellectual Property",
  "Indemnification",
  "Warranty",
  "Force Majeure",
  "Dispute Resolution",
  "General Terms"
];

// Helper functions for risk visualization
const getRiskColorClass = (score: number): string => {
  if (score <= 3) return 'bg-risk-low';
  if (score <= 6) return 'bg-risk-medium';
  return 'bg-risk-high';
};

const getRiskTextColorClass = (score: number): string => {
  if (score <= 3) return 'text-risk-low';
  if (score <= 6) return 'text-risk-medium';
  return 'text-risk-high';
};

const getRiskLabel = (score: number): string => {
  if (score <= 3) return 'Low';
  if (score <= 6) return 'Medium';
  return 'High';
};

const ComplianceRules: React.FC<ComplianceRulesProps> = ({ 
  rules, 
  onAddRule, 
  onUpdateRule, 
  onDeleteRule,
  isLoading
}) => {
  const [expandedRuleId, setExpandedRuleId] = useState<number | null>(null);

  const toggleRuleExpansion = (id: number | undefined) => {
    if (id !== undefined) {
      setExpandedRuleId(expandedRuleId === id ? null : id);
    }
  };

  const handleKeywordChange = (id: number | undefined, value: string) => {
    if (id !== undefined) {
      const rule = rules.find(r => r.id === id);
      if (rule) {
        onUpdateRule({ ...rule, keyword: value });
      }
    }
  };

  const handleAllowedChange = (id: number | undefined, value: string) => {
    if (id !== undefined) {
      const rule = rules.find(r => r.id === id);
      if (rule) {
        onUpdateRule({ ...rule, allowed: value === 'true' });
      }
    }
  };

  const handleRiskScoreChange = (id: number | undefined, value: string) => {
    if (id !== undefined) {
      const rule = rules.find(r => r.id === id);
      if (rule) {
        const riskScore = parseInt(value);
        if (!isNaN(riskScore) && riskScore >= 1 && riskScore <= 10) {
          onUpdateRule({ ...rule, riskScore });
        }
      }
    }
  };

  const handleCategoryChange = (id: number | undefined, value: string) => {
    if (id !== undefined) {
      const rule = rules.find(r => r.id === id);
      if (rule) {
        onUpdateRule({ ...rule, category: value });
      }
    }
  };

  const handleDescriptionChange = (id: number | undefined, value: string) => {
    if (id !== undefined) {
      const rule = rules.find(r => r.id === id);
      if (rule) {
        onUpdateRule({ ...rule, description: value });
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="bg-gradient-to-r from-neutral-50 to-white border-b border-neutral-200 p-5">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-xl font-semibold text-neutral-900">Compliance Rules</h2>
          <button 
            className="text-primary hover:text-primary-dark transition-colors"
            onClick={onAddRule}
            disabled={isLoading}
            aria-label="Add new rule"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </button>
        </div>
        <p className="text-neutral-500 text-sm">
          Define keywords and phrases to check in contracts
        </p>
      </div>
      
      <div className="p-5">
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {rules.length === 0 && !isLoading && (
            <div className="text-center py-8 bg-neutral-50/50 rounded-lg border border-dashed border-neutral-300">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 mx-auto text-neutral-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                />
              </svg>
              <p className="text-neutral-600 font-medium">No compliance rules added yet</p>
              <p className="text-neutral-500 text-sm mt-1">
                Add rules to define contract compliance criteria
              </p>
            </div>
          )}
          
          {isLoading && rules.length === 0 && (
            <div className="flex flex-col justify-center items-center py-10">
              <div className="relative">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-neutral-200"></div>
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary absolute top-0 left-0"></div>
              </div>
              <p className="text-neutral-600 mt-4 text-sm">Loading compliance rules...</p>
            </div>
          )}
          
          {rules.map((rule) => (
            <div 
              key={rule.id} 
              className="bg-white rounded-lg p-4 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <div className="mb-3 flex-grow">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Keyword or phrase
                  </label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 rounded-md border border-neutral-300 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                    placeholder="Enter keyword or phrase" 
                    value={rule.keyword}
                    onChange={(e) => handleKeywordChange(rule.id, e.target.value)}
                  />
                </div>
                <div className="ml-2 flex flex-col items-center">
                  <button 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-primary/5 transition-colors mb-1"
                    onClick={() => toggleRuleExpansion(rule.id)}
                    aria-label="Toggle advanced settings"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d={expandedRuleId === rule.id 
                          ? "M5 15l7-7 7 7" 
                          : "M19 9l-7 7-7-7"}
                      />
                    </svg>
                  </button>
                  <button 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-risk-high hover:bg-risk-high/10 transition-colors"
                    onClick={() => rule.id !== undefined && onDeleteRule(rule.id)}
                    disabled={isLoading}
                    aria-label="Delete rule"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Status
                </label>
                <select 
                  className="w-full p-2.5 rounded-md border border-neutral-300 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                  value={rule.allowed.toString()}
                  onChange={(e) => handleAllowedChange(rule.id, e.target.value)}
                >
                  <option value="true">Allowed</option>
                  <option value="false">Not Allowed</option>
                </select>
              </div>
              
              {/* Advanced settings (expanded view) */}
              {expandedRuleId === rule.id && (
                <div className="space-y-3 pt-2 pb-1 border-t border-dashed border-neutral-200 mt-2">
                  <h4 className="font-medium text-sm text-neutral-800">Advanced Settings</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Risk Score (1-10)
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      max="10"
                      className="w-full p-2.5 rounded-md border border-neutral-300 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                      placeholder="Risk score (1-10)" 
                      value={rule.riskScore || 5}
                      onChange={(e) => handleRiskScoreChange(rule.id, e.target.value)}
                    />
                    
                    <div className="mt-1 flex items-center">
                      <div className="w-full bg-neutral-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${getRiskColorClass(rule.riskScore || 5)}`}
                          style={{ width: `${((rule.riskScore || 5) / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${getRiskTextColorClass(rule.riskScore || 5)}`}>
                        {getRiskLabel(rule.riskScore || 5)}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Category
                    </label>
                    <select
                      className="w-full p-2.5 rounded-md border border-neutral-300 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white"
                      value={rule.category || ""}
                      onChange={(e) => handleCategoryChange(rule.id, e.target.value)}
                    >
                      <option value="">Select a category</option>
                      {RULE_CATEGORIES.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full p-2.5 rounded-md border border-neutral-300 shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                      placeholder="Description of this compliance rule"
                      rows={2}
                      value={rule.description || ""}
                      onChange={(e) => handleDescriptionChange(rule.id, e.target.value)}
                    />
                  </div>
                </div>
              )}
              
              <div className={`mt-3 pt-3 border-t border-neutral-100 text-xs text-neutral-500 flex ${rule.category ? 'justify-between' : ''} items-center`}>
                <span>
                  {rule.allowed 
                    ? <span className="text-risk-low">✓ This content is allowed in contracts</span>
                    : <span className="text-risk-high">⨯ This content will flag as non-compliant</span>
                  }
                </span>
                
                {rule.category && (
                  <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                    {rule.category}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-5 pt-4 border-t border-neutral-200">
          <button 
            className="w-full bg-gradient-to-r from-primary/90 to-blue-600/90 text-white py-2.5 rounded-lg hover:from-primary hover:to-blue-600 transition-all font-medium flex items-center justify-center shadow-sm"
            onClick={onAddRule}
            disabled={isLoading}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
            <span>Add New Rule</span>
          </button>
          
          <p className="text-xs text-neutral-500 mt-4 text-center">
            Rules define what content is allowed or disallowed in your contracts
          </p>
        </div>
      </div>
    </div>
  );
};

export default ComplianceRules;
