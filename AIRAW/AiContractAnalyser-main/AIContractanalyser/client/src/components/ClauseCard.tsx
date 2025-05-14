import React from 'react';
import { ClauseType } from '@/types';
import { ClauseStatusToggle } from './ClauseStatusToggle';

interface ClauseCardProps {
  clause: ClauseType;
  onViewDetails: (clause: ClauseType) => void;
}

const ClauseCard: React.FC<ClauseCardProps> = ({ clause, onViewDetails }) => {
  // Determine risk level icon and color classes
  const getRiskData = (score: number) => {
    if (score >= 7) {
      return {
        level: 'High Risk',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-risk-high mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        ),
        bgClass: 'bg-risk-high/10',
        borderClass: 'border-risk-high/30',
        textClass: 'text-risk-high',
        gradientClass: 'from-risk-high/20 to-transparent'
      };
    } else if (score >= 4) {
      return {
        level: 'Medium Risk',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-risk-medium mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        ),
        bgClass: 'bg-risk-medium/10',
        borderClass: 'border-risk-medium/30',
        textClass: 'text-risk-medium',
        gradientClass: 'from-risk-medium/20 to-transparent'
      };
    } else {
      return {
        level: 'Low Risk',
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-risk-low mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        ),
        bgClass: 'bg-risk-low/10',
        borderClass: 'border-risk-low/30',
        textClass: 'text-risk-low',
        gradientClass: 'from-risk-low/20 to-transparent'
      };
    }
  };

  // Get compliance status data
  const getComplianceData = (status: string) => {
    if (status === 'Compliant') {
      return {
        bgClass: 'bg-risk-low/10',
        textClass: 'text-risk-low'
      };
    } else if (status === 'Non-Compliant') {
      return {
        bgClass: 'bg-risk-high/10',
        textClass: 'text-risk-high'
      };
    } else {
      return {
        bgClass: 'bg-risk-medium/10',
        textClass: 'text-risk-medium'
      };
    }
  };

  const riskData = getRiskData(clause.risk_score);
  const complianceData = getComplianceData(clause.compliance_status);
  
  // Format risk score for display (out of 10)
  const formattedRiskScore = (clause.risk_score / 10).toFixed(1);

  // Truncate clause text if too long
  const truncateText = (text: string, maxLength = 180) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  const truncatedClause = truncateText(clause.clause);

  return (
    <div className={`bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg border-l-4 ${riskData.borderClass} shadow-sm`}>
      <div className={`bg-gradient-to-r ${riskData.gradientClass} px-5 py-3 flex justify-between items-center`}>
        <div className="flex items-center">
          {riskData.icon}
          <h3 className="font-semibold text-neutral-800">Clause {clause.id}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${riskData.bgClass} ${riskData.textClass} flex items-center`}>
            <span>{riskData.level}</span>
          </div>
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${complianceData.bgClass} ${complianceData.textClass}`}>
            {clause.compliance_status}
          </div>
        </div>
      </div>
      
      <div className="p-5">
        <p className="text-neutral-700 leading-relaxed mb-4">{truncatedClause}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {clause.section && (
            <div className="px-2.5 py-1 rounded-md text-xs bg-neutral-100 text-neutral-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <span>Section {clause.section}</span>
            </div>
          )}
          {clause.category && (
            <div className="px-2.5 py-1 rounded-md text-xs bg-neutral-100 text-neutral-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                <line x1="7" y1="7" x2="7.01" y2="7"></line>
              </svg>
              <span>{clause.category}</span>
            </div>
          )}
          {clause.page && (
            <div className="px-2.5 py-1 rounded-md text-xs bg-neutral-100 text-neutral-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              </svg>
              <span>Page {clause.page}</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 ${riskData.textClass}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"></path>
                <path d="M15 9l-6 6"></path>
                <path d="M9 9l6 6"></path>
              </svg>
              <span className={`text-sm font-semibold ${riskData.textClass}`}>{formattedRiskScore}</span>
            </div>
            
            {/* Status toggle for marking as completed */}
            <ClauseStatusToggle clause={clause} />
          </div>
          
          <button 
            className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center"
            onClick={() => onViewDetails(clause)}
          >
            <span>View Details</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17l9.2-9.2M17 17V7H7"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClauseCard;
