import React, { useState, useMemo } from 'react';
import { ClauseType, FilterType, SortType } from '@/types';
import ClauseCard from './ClauseCard';

interface ClauseResultsProps {
  clauses: ClauseType[];
  isLoading: boolean;
  onViewDetails: (clause: ClauseType) => void;
}

const ClauseResults: React.FC<ClauseResultsProps> = ({ 
  clauses, 
  isLoading, 
  onViewDetails 
}) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('risk');
  
  const filteredAndSortedClauses = useMemo(() => {
    // Apply filters
    let result = [...clauses];
    
    if (filter === 'compliant') {
      result = result.filter(clause => clause.compliance_status === 'Compliant');
    } else if (filter === 'non-compliant') {
      result = result.filter(clause => clause.compliance_status === 'Non-Compliant');
    } else if (filter === 'high-risk') {
      result = result.filter(clause => clause.risk_score >= 7);
    }
    
    // Apply sorting
    if (sortBy === 'risk') {
      result.sort((a, b) => b.risk_score - a.risk_score);
    } else if (sortBy === 'compliance') {
      result.sort((a, b) => {
        const order = { 'Non-Compliant': 0, 'Review Needed': 1, 'Compliant': 2 };
        return (order[a.compliance_status as keyof typeof order] ?? 0) - 
               (order[b.compliance_status as keyof typeof order] ?? 0);
      });
    }
    
    return result;
  }, [clauses, filter, sortBy]);

  // Calculate summary stats
  const highRiskCount = useMemo(() => 
    clauses.filter(clause => clause.risk_score >= 7).length, 
    [clauses]
  );
  
  const mediumRiskCount = useMemo(() => 
    clauses.filter(clause => clause.risk_score >= 4 && clause.risk_score < 7).length, 
    [clauses]
  );
  
  const lowRiskCount = useMemo(() => 
    clauses.filter(clause => clause.risk_score < 4).length, 
    [clauses]
  );
  
  // Calculate compliance stats
  const compliantCount = useMemo(() => 
    clauses.filter(clause => clause.compliance_status === 'Compliant').length,
    [clauses]
  );
  
  const nonCompliantCount = useMemo(() => 
    clauses.filter(clause => clause.compliance_status === 'Non-Compliant').length,
    [clauses]
  );
  
  const reviewNeededCount = useMemo(() => 
    clauses.filter(clause => clause.compliance_status === 'Review Needed').length,
    [clauses]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="border-b border-neutral-200 bg-gradient-to-r from-neutral-50 to-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-1">Extracted Clauses</h2>
            <p className="text-neutral-500 text-sm">
              {clauses.length > 0 
                ? `Showing ${filteredAndSortedClauses.length} of ${clauses.length} total clauses` 
                : 'Upload a contract to begin analysis'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4 md:mt-0">
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-neutral-300 text-neutral-700 py-2 pl-3 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm transition-all"
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                disabled={isLoading || clauses.length === 0}
              >
                <option value="all">All Clauses</option>
                <option value="compliant">Compliant Only</option>
                <option value="non-compliant">Non-Compliant Only</option>
                <option value="high-risk">High Risk Only</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <select 
                className="appearance-none bg-white border border-neutral-300 text-neutral-700 py-2 pl-3 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary shadow-sm transition-all"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                disabled={isLoading || clauses.length === 0}
              >
                <option value="risk">Sort by Risk Score</option>
                <option value="compliance">Sort by Compliance</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Summary stats cards */}
        {clauses.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-2">
            <div className="bg-gradient-to-br from-risk-high/10 to-risk-high/5 rounded-lg p-4 border border-risk-high/20">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-risk-high mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <p className="text-sm font-medium text-neutral-800">High Risk</p>
              </div>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-risk-high">{highRiskCount}</p>
                <p className="ml-1 text-sm text-neutral-500">clauses</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-risk-medium/10 to-risk-medium/5 rounded-lg p-4 border border-risk-medium/20">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-risk-medium mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <p className="text-sm font-medium text-neutral-800">Medium Risk</p>
              </div>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-risk-medium">{mediumRiskCount}</p>
                <p className="ml-1 text-sm text-neutral-500">clauses</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-risk-low/10 to-risk-low/5 rounded-lg p-4 border border-risk-low/20">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-risk-low mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p className="text-sm font-medium text-neutral-800">Low Risk</p>
              </div>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-risk-low">{lowRiskCount}</p>
                <p className="ml-1 text-sm text-neutral-500">clauses</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-risk-high/10 to-risk-low/5 rounded-lg p-4 border border-neutral-200">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path>
                  <line x1="16" y1="8" x2="2" y2="22"></line>
                  <line x1="17.5" y1="15" x2="9" y2="15"></line>
                </svg>
                <p className="text-sm font-medium text-neutral-800">Non-Compliant</p>
              </div>
              <div className="flex items-baseline">
                <p className="text-2xl font-bold text-primary">{nonCompliantCount}</p>
                <p className="ml-1 text-sm text-neutral-500">clauses</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-neutral-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary absolute top-0 left-0"></div>
          </div>
          <p className="text-neutral-600 mt-6 font-medium">Analyzing contract clauses...</p>
          <p className="text-neutral-500 text-sm mt-2">This may take a moment</p>
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && clauses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-gradient-to-br from-neutral-100 to-neutral-50 p-6 mb-6 shadow-inner">
            <svg 
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Clauses Analyzed Yet</h3>
          <p className="text-neutral-600 max-w-md mx-auto">Upload a contract document to start the AI-powered analysis and view extracted clauses here.</p>
          <div className="mt-6 bg-primary/5 rounded-lg p-4 max-w-md mx-auto border border-primary/10">
            <p className="text-sm text-neutral-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Use the upload panel on the left to begin
            </p>
          </div>
        </div>
      )}
      
      {/* Results */}
      {!isLoading && clauses.length > 0 && (
        <>
          <div className="space-y-4 max-h-[calc(100vh-320px)] overflow-y-auto p-6">
            {filteredAndSortedClauses.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50/50 rounded-lg border border-neutral-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-neutral-400 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="11" y1="8" x2="11" y2="14"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
                <p className="text-neutral-600 font-medium">No clauses match the current filter</p>
                <p className="text-neutral-500 text-sm mt-1">Try changing your filter settings</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredAndSortedClauses.map((clause) => (
                  <ClauseCard key={clause.id} clause={clause} onViewDetails={onViewDetails} />
                ))}
              </div>
            )}
          </div>
          
          {/* Compliance progress */}
          {filteredAndSortedClauses.length > 0 && (
            <div className="border-t border-neutral-200 bg-neutral-50 p-6">
              <h3 className="font-medium text-neutral-800 mb-3">Compliance Overview</h3>
              <div className="bg-white rounded-lg p-4 border border-neutral-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-600">Compliance Status</span>
                  <span className="text-sm font-medium text-neutral-800">
                    {compliantCount} of {clauses.length} clauses compliant ({Math.round((compliantCount / clauses.length) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="flex h-full">
                    <div 
                      className="bg-risk-low h-full" 
                      style={{ width: `${(compliantCount / clauses.length) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-risk-medium h-full" 
                      style={{ width: `${(reviewNeededCount / clauses.length) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-risk-high h-full" 
                      style={{ width: `${(nonCompliantCount / clauses.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-neutral-500">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-risk-low rounded-full mr-1"></div>
                    <span>Compliant</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-risk-medium rounded-full mr-1"></div>
                    <span>Review Needed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-risk-high rounded-full mr-1"></div>
                    <span>Non-Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ClauseResults;
