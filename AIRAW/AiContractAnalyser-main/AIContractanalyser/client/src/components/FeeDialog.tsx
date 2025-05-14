import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import FeeTable, { Fee } from "./FeeTable";
import { Banknote, Sparkles, ChevronRight, PlusCircle } from "lucide-react";

interface FeeDialogProps {
  fees: Fee[] | undefined;
  isLoading: boolean;
}

export function FeeDialog({ fees, isLoading }: FeeDialogProps) {
  // Determine if there are any fees to display
  const hasFees = fees && fees.length > 0;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`relative w-full flex items-center justify-between py-4 px-5 ${
            hasFees 
              ? 'bg-gradient-to-br from-white to-amber-50 border-amber-200 hover:border-amber-300 shadow-sm' 
              : 'border-neutral-200 bg-neutral-50'
          } rounded-xl hover:shadow-md transition-all gap-2`}
        >
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-amber-100">
              <Banknote className={`h-5 w-5 ${hasFees ? 'text-amber-600' : 'text-neutral-500'}`} />
            </div>
            <div className="text-left">
              <div className={`font-semibold text-base ${hasFees ? 'text-amber-800' : 'text-neutral-600'}`}>
                {hasFees ? 'Contract Fees' : 'No Fees Found'}
              </div>
              <div className="text-xs text-neutral-500">
                {hasFees ? `${fees.length} fees identified` : 'Try extracting fees from the contract'}
              </div>
            </div>
          </div>
          
          <div className={`flex items-center gap-1 ${hasFees ? 'text-amber-600' : 'text-neutral-400'}`}>
            <span className="text-sm mr-1">{hasFees ? 'View details' : 'Check'}</span>
            <ChevronRight className="h-4 w-4" />
          </div>
          
          {hasFees && (
            <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-amber-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {fees.length}
            </div>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm mr-3">
              <Banknote className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                Contract Fee Structure
              </DialogTitle>
              <DialogDescription>
                AI-extracted fee information from the contract document
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-gradient-to-b from-white to-amber-50 p-6 rounded-xl border border-amber-100 mt-4">
          {!hasFees && !isLoading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-amber-100 mx-auto flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-amber-500" />
              </div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">No Fees Found</h3>
              <p className="text-neutral-600 max-w-md mx-auto mb-6">
                The AI analysis didn't detect any fee structures in this contract. Try using the "Extract Fees" button to find additional fees.
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-amber-600 bg-amber-100 px-3 py-2 rounded-full">
                <PlusCircle className="h-3 w-3" />
                Use the Extract Fees button for deeper analysis
              </div>
            </div>
          )}
          
          {(hasFees || isLoading) && (
            <FeeTable fees={fees} isLoading={isLoading} />
          )}
        </div>

        <div className="flex justify-end mt-6">
          <DialogClose asChild>
            <Button variant="outline" className="rounded-full px-6">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FeeDialog;