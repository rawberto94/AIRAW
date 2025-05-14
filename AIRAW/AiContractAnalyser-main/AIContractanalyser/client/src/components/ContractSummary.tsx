import React from 'react';
import { Fee } from './FeeTable';
import FeeDialog from './FeeDialog';
import FinancialExtractButtons from './FinancialExtractButtons';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Users, 
  Lock,
  ShieldAlert,
  ScrollText, 
  Ban,
  BookOpen,
  Sparkles,
  DollarSign
} from 'lucide-react';

export interface ContractSummaryProps {
  documentId: string;
  isLoading: boolean;
  summary?: {
    title?: string;
    parties?: {
      party1?: string;
      party2?: string;
    };
    effectiveDate?: string;
    termLength?: string;
    paymentTerms?: string[];
    rateCard?: {
      item: string;
      rate: string;
      unit?: string;
    }[];
    fees?: Fee[];
    keyObligations?: string[];
    confidentialityTerms?: string;
    terminationClauses?: string[];
  };
}

const ContractSummary: React.FC<ContractSummaryProps> = ({ 
  documentId, 
  isLoading,
  summary
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-white border-b border-neutral-200 p-6">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm mr-4">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
              Contract Summary
            </h2>
            <p className="text-neutral-500">
              AI-powered analysis and extraction of key contract details
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-3 border-neutral-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-t-3 border-blue-600 absolute top-0 left-0"></div>
            </div>
            <p className="text-neutral-600 mt-5 text-base">
              <span className="font-medium">AI is analyzing your contract</span>
              <span className="block text-sm text-neutral-500 mt-1">This may take a few moments...</span>
            </p>
          </div>
        ) : !summary ? (
          <div className="text-center py-16 bg-gradient-to-b from-white to-neutral-50 rounded-xl border border-dashed border-neutral-300">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">No Contract Analysis Available</h3>
            <p className="text-neutral-500 text-sm max-w-md mx-auto">
              Upload a contract document using the file uploader to generate an AI-powered analysis and summary
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Add financial extraction buttons at the top */}
            <FinancialExtractButtons documentId={documentId} />
            
            {/* Contract title with badge */}
            {summary.title && (
              <div className="relative">
                <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <div className="pl-4">
                  <div className="inline-block px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium mb-2">
                    Contract Document
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900">{summary.title}</h3>
                </div>
              </div>
            )}
            
            {/* Parties with improved design */}
            {summary.parties && (
              <div className="bg-gradient-to-br from-white to-neutral-50 rounded-xl p-1">
                <div className="bg-white rounded-lg p-5 border border-neutral-200 shadow-sm">
                  <h4 className="text-sm font-medium text-neutral-500 mb-4 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-blue-500" />
                    Contract Parties
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <span className="text-blue-700 font-medium">1</span>
                        </div>
                        <h5 className="text-sm font-medium text-blue-700">Party 1</h5>
                      </div>
                      <p className="text-neutral-800 pl-10">{summary.parties.party1 || 'N/A'}</p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                          <span className="text-purple-700 font-medium">2</span>
                        </div>
                        <h5 className="text-sm font-medium text-purple-700">Party 2</h5>
                      </div>
                      <p className="text-neutral-800 pl-10">{summary.parties.party2 || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Term details with icons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {summary.effectiveDate && (
                <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mr-4 shrink-0">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 mb-1">Effective Date</h4>
                      <p className="text-lg font-semibold text-neutral-900">{summary.effectiveDate}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {summary.termLength && (
                <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mr-4 shrink-0">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-neutral-500 mb-1">Term Length</h4>
                      <p className="text-lg font-semibold text-neutral-900">{summary.termLength}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Payment terms section */}
            {summary.paymentTerms && summary.paymentTerms.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
                <h4 className="text-base font-semibold text-neutral-800 mb-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                    <Sparkles className="h-4 w-4 text-green-600" />
                  </div>
                  Payment Terms
                </h4>
                <div className="bg-gradient-to-br from-green-50 to-neutral-50 p-5 rounded-lg border border-green-100">
                  <ul className="space-y-3 text-neutral-700">
                    {summary.paymentTerms.map((term, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 shrink-0">
                          <span className="text-green-700 text-xs font-medium">{index + 1}</span>
                        </div>
                        <span className="text-neutral-800">{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Rate card with improved design */}
            {summary.rateCard && summary.rateCard.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
                <h4 className="text-base font-semibold text-neutral-800 mb-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <ScrollText className="h-4 w-4 text-blue-600" />
                  </div>
                  Rate Card
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left p-3 bg-blue-50 text-blue-800 font-medium rounded-tl-lg">Item</th>
                        <th className="text-left p-3 bg-blue-50 text-blue-800 font-medium">Rate</th>
                        <th className="text-left p-3 bg-blue-50 text-blue-800 font-medium rounded-tr-lg">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.rateCard?.map((item, index, array) => (
                        <tr key={index} className={`${index === array.length - 1 ? 'border-b-0' : 'border-b border-neutral-200'}`}>
                          <td className="p-3 text-neutral-700">{item.item}</td>
                          <td className="p-3 text-neutral-900 font-medium">{item.rate}</td>
                          <td className="p-3 text-neutral-500">{item.unit || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Fee Structure Button with improved design */}
            <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
              <h4 className="text-base font-semibold text-neutral-800 mb-4 flex items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </div>
                Fee Structure
              </h4>
              <FeeDialog fees={summary.fees} isLoading={isLoading} />
            </div>
            
            {/* Key obligations with improved design */}
            {summary.keyObligations && summary.keyObligations.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
                <h4 className="text-base font-semibold text-neutral-800 mb-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                  </div>
                  Key Obligations
                </h4>
                <div className="bg-gradient-to-br from-indigo-50 to-neutral-50 p-5 rounded-lg border border-indigo-100">
                  <ul className="space-y-4">
                    {summary.keyObligations.map((obligation, index) => (
                      <li key={index} className="flex items-start group">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 mt-0.5 shrink-0 group-hover:bg-indigo-200 transition-colors">
                          <span className="text-indigo-700 text-xs font-medium">{index + 1}</span>
                        </div>
                        <span className="text-neutral-800">{obligation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Confidentiality terms with improved design */}
            {summary.confidentialityTerms && (
              <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
                <h4 className="text-base font-semibold text-neutral-800 mb-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                    <Lock className="h-4 w-4 text-red-600" />
                  </div>
                  Confidentiality Terms
                </h4>
                <div className="bg-gradient-to-br from-red-50 to-neutral-50 p-5 rounded-lg border border-red-100">
                  <p className="text-neutral-800">{summary.confidentialityTerms}</p>
                </div>
              </div>
            )}
            
            {/* Termination clauses with improved design */}
            {summary.terminationClauses && summary.terminationClauses.length > 0 && (
              <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
                <h4 className="text-base font-semibold text-neutral-800 mb-4 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                    <Ban className="h-4 w-4 text-orange-600" />
                  </div>
                  Termination Clauses
                </h4>
                <div className="bg-gradient-to-br from-orange-50 to-neutral-50 p-5 rounded-lg border border-orange-100">
                  <ul className="space-y-4">
                    {summary.terminationClauses.map((clause, index) => (
                      <li key={index} className="flex items-start group">
                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-3 mt-0.5 shrink-0 group-hover:bg-orange-200 transition-colors">
                          <span className="text-orange-700 text-xs font-medium">{index + 1}</span>
                        </div>
                        <span className="text-neutral-800">{clause}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContractSummary;