import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { BarChart3, DollarSign, Clock, FileText, Info, Tag } from "lucide-react";

export interface Fee {
  name: string;
  amount: string;
  frequency?: string;
  description?: string;
  category?: string;
}

interface FeeTableProps {
  fees: Fee[] | undefined;
  isLoading: boolean;
}

export function FeeTable({ fees, isLoading }: FeeTableProps) {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="h-16 w-16 relative">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-dashed border-amber-300"></div>
            <div className="absolute inset-3 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between mb-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle no fees
  if (!fees || fees.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-neutral-100 mx-auto flex items-center justify-center mb-4">
          <BarChart3 className="h-8 w-8 text-neutral-400" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-2">No Fee Structure Found</h3>
        <p className="text-neutral-500 max-w-md mx-auto">
          The AI analysis did not detect any fee-related clauses in this contract. Try manually reviewing the document or using the extract fees feature.
        </p>
      </div>
    );
  }

  // Group fees by category if available
  const feesByCategory: Record<string, Fee[]> = {};
  
  fees.forEach(fee => {
    const category = fee.category || "Other Fees";
    if (!feesByCategory[category]) {
      feesByCategory[category] = [];
    }
    feesByCategory[category].push(fee);
  });

  const hasCategories = Object.keys(feesByCategory).length > 1;

  const getCategoryColor = (category: string): string => {
    const categoryColors: Record<string, { bg: string, text: string, border: string }> = {
      "Recurring": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
      "One-time": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
      "Registration": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
      "Service": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
      "Late": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
      "Other Fees": { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" }
    };
    
    return (categoryColors[category] || categoryColors["Other Fees"]).bg;
  };
  
  const getCategoryTextColor = (category: string): string => {
    const categoryColors: Record<string, { bg: string, text: string, border: string }> = {
      "Recurring": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
      "One-time": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
      "Registration": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
      "Service": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
      "Late": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
      "Other Fees": { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" }
    };
    
    return (categoryColors[category] || categoryColors["Other Fees"]).text;
  };
  
  const getCategoryBorderColor = (category: string): string => {
    const categoryColors: Record<string, { bg: string, text: string, border: string }> = {
      "Recurring": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
      "One-time": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
      "Registration": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
      "Service": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
      "Late": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
      "Other Fees": { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" }
    };
    
    return (categoryColors[category] || categoryColors["Other Fees"]).border;
  };

  // Render fees table
  return (
    <div className="w-full">
      {hasCategories ? (
        // Render categorized fees
        <div className="space-y-6">
          {Object.entries(feesByCategory).map(([category, categoryFees]) => (
            <div key={category} className={`rounded-xl border ${getCategoryBorderColor(category)} overflow-hidden`}>
              <div className={`px-4 py-3 ${getCategoryColor(category)} flex items-center justify-between`}>
                <div className="flex items-center">
                  <Tag className={`h-4 w-4 mr-2 ${getCategoryTextColor(category)}`} />
                  <h3 className={`font-medium ${getCategoryTextColor(category)}`}>
                    {category}
                  </h3>
                </div>
                <Badge className={`${getCategoryColor(category)} ${getCategoryTextColor(category)} border-0`}>
                  {categoryFees.length} {categoryFees.length === 1 ? 'fee' : 'fees'}
                </Badge>
              </div>
              
              <div className="bg-white">
                {categoryFees.map((fee, index) => (
                  <div key={index} className={`p-4 ${index !== categoryFees.length - 1 ? 'border-b' : ''}`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <div className="font-medium text-neutral-900 mb-1 sm:mb-0">{fee.name}</div>
                      <div className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-sm">
                        <DollarSign className="h-3.5 w-3.5" />
                        {fee.amount}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      {fee.frequency && (
                        <div className="flex items-center text-neutral-600">
                          <Clock className="h-3.5 w-3.5 mr-1 text-neutral-400" />
                          {fee.frequency}
                        </div>
                      )}
                      
                      {fee.description && (
                        <div className="flex items-start text-neutral-600 max-w-xl">
                          <Info className="h-3.5 w-3.5 mr-1 text-neutral-400 mt-0.5 shrink-0" />
                          <span className="text-neutral-500">{fee.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Render simple fee list
        <div className="rounded-xl border border-amber-200 overflow-hidden">
          <div className="px-4 py-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2 text-amber-700" />
              <h3 className="font-medium text-amber-800">
                Contract Fees
              </h3>
            </div>
            <Badge className="bg-amber-100 text-amber-800 border-0">
              {fees.length} {fees.length === 1 ? 'fee' : 'fees'}
            </Badge>
          </div>
          
          <div className="bg-white divide-y divide-amber-100">
            {fees.map((fee, index) => (
              <div key={index} className="p-4 hover:bg-amber-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                  <div className="font-medium text-neutral-900 mb-1 sm:mb-0">{fee.name}</div>
                  <div className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full text-sm">
                    <DollarSign className="h-3.5 w-3.5" />
                    {fee.amount}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 mt-2 text-sm">
                  {fee.frequency && (
                    <div className="flex items-center text-neutral-600">
                      <Clock className="h-3.5 w-3.5 mr-1 text-neutral-400" />
                      {fee.frequency}
                    </div>
                  )}
                  
                  {fee.category && (
                    <div className="flex items-center text-neutral-600">
                      <Tag className="h-3.5 w-3.5 mr-1 text-neutral-400" />
                      {fee.category}
                    </div>
                  )}
                  
                  {fee.description && (
                    <div className="flex items-start text-neutral-600 max-w-xl">
                      <Info className="h-3.5 w-3.5 mr-1 text-neutral-400 mt-0.5 shrink-0" />
                      <span className="text-neutral-500">{fee.description}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-neutral-500 flex items-center gap-1 justify-end">
        <FileText className="h-3 w-3" />
        Fee details extracted directly from contract language
      </div>
    </div>
  );
}

export default FeeTable;