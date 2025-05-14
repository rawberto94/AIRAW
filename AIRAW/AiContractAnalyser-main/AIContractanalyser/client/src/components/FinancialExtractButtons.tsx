import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Banknote, 
  DollarSign, 
  CreditCard, 
  Receipt, 
  AlertCircle,
  PlusCircle,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FinancialExtractButtonsProps {
  documentId: string;
}

export function FinancialExtractButtons({ documentId }: FinancialExtractButtonsProps) {
  const { toast } = useToast();

  const extractFeesButtonMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/extract-fees/${documentId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-summary", documentId] });
      toast({
        title: "Fees extracted",
        description: "Contract fees have been extracted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error extracting fees",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const extractCostsButtonMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/extract-costs/${documentId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-summary", documentId] });
      toast({
        title: "Costs extracted",
        description: "Contract costs have been extracted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error extracting costs",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const extractPaymentTermsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/extract-payment-terms/${documentId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contract-summary", documentId] });
      toast({
        title: "Payment terms extracted",
        description: "Contract payment terms have been extracted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error extracting payment terms",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-neutral-800 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Financial Analysis
          </span>
        </h3>
        <div className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
          Click buttons to extract more details
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative group">
          <Button 
            variant="outline" 
            className="w-full h-24 flex flex-col items-center justify-center gap-2 border-blue-200 hover:border-blue-400 bg-gradient-to-b from-white to-blue-50 shadow-sm group-hover:shadow transition-all rounded-xl"
            onClick={() => extractFeesButtonMutation.mutate()}
            disabled={extractFeesButtonMutation.isPending}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <Banknote className="h-5 w-5 text-blue-600" />
            </div>
            <span className="font-medium text-blue-700">Extract Fees</span>
            {extractFeesButtonMutation.isPending ? (
              <div className="absolute right-3 top-3 animate-spin h-4 w-4 border-2 border-blue-200 rounded-full border-t-blue-500"></div>
            ) : (
              <PlusCircle className="absolute right-3 top-3 h-4 w-4 text-blue-400 opacity-70 group-hover:opacity-100" />
            )}
          </Button>
          <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        
        <div className="relative group">
          <Button 
            variant="outline" 
            className="w-full h-24 flex flex-col items-center justify-center gap-2 border-green-200 hover:border-green-400 bg-gradient-to-b from-white to-green-50 shadow-sm group-hover:shadow transition-all rounded-xl"
            onClick={() => extractCostsButtonMutation.mutate()}
            disabled={extractCostsButtonMutation.isPending}
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <span className="font-medium text-green-700">Extract Costs</span>
            {extractCostsButtonMutation.isPending ? (
              <div className="absolute right-3 top-3 animate-spin h-4 w-4 border-2 border-green-200 rounded-full border-t-green-500"></div>
            ) : (
              <PlusCircle className="absolute right-3 top-3 h-4 w-4 text-green-400 opacity-70 group-hover:opacity-100" />
            )}
          </Button>
          <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-green-300 to-green-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        
        <div className="relative group">
          <Button 
            variant="outline" 
            className="w-full h-24 flex flex-col items-center justify-center gap-2 border-purple-200 hover:border-purple-400 bg-gradient-to-b from-white to-purple-50 shadow-sm group-hover:shadow transition-all rounded-xl"
            onClick={() => extractPaymentTermsMutation.mutate()}
            disabled={extractPaymentTermsMutation.isPending}
          >
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <span className="font-medium text-purple-700">Extract Payment Terms</span>
            {extractPaymentTermsMutation.isPending ? (
              <div className="absolute right-3 top-3 animate-spin h-4 w-4 border-2 border-purple-200 rounded-full border-t-purple-500"></div>
            ) : (
              <PlusCircle className="absolute right-3 top-3 h-4 w-4 text-purple-400 opacity-70 group-hover:opacity-100" />
            )}
          </Button>
          <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-300 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>
    </div>
  );
}

export default FinancialExtractButtons;