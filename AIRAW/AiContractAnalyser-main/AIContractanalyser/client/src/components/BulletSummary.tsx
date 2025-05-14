import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient'; 
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileDigit, ListChecks, RefreshCw, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface BulletSummaryProps {
  documentId: string;
}

interface BulletSummaryResponse {
  message: string;
  bulletPoints: string[];
}

export default function BulletSummary({ documentId }: BulletSummaryProps) {
  const [bulletPoints, setBulletPoints] = React.useState<string[]>([]);
  const [isVisible, setIsVisible] = React.useState<boolean>(false);
  const { toast } = useToast();

  const generateBulletSummaryMutation = useMutation<BulletSummaryResponse, Error>({
    mutationFn: async () => {
      const response = await fetch(`/api/generate-bullet-summary/${documentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate bullet summary');
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      setBulletPoints(data.bulletPoints || []);
      setIsVisible(true);
      toast({
        title: 'Summary generated',
        description: 'Contract summary has been generated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error generating summary',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  if (!isVisible && !generateBulletSummaryMutation.isPending) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm mr-4 shrink-0">
                <FileDigit className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">AI Contract Analysis</h3>
                <p className="text-neutral-500 text-sm">Generate a concise AI summary of key contract points</p>
              </div>
            </div>
            <Button 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm"
              onClick={() => generateBulletSummaryMutation.mutate()}
              disabled={generateBulletSummaryMutation.isPending}
            >
              <ListChecks className="h-4 w-4 mr-2" />
              Generate Summary
              {generateBulletSummaryMutation.isPending && (
                <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-sm mr-4">
              <FileDigit className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-800">Contract Analysis</h3>
              <p className="text-neutral-500 text-sm">AI-generated summary of key points</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => generateBulletSummaryMutation.mutate()}
            disabled={generateBulletSummaryMutation.isPending}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${generateBulletSummaryMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {generateBulletSummaryMutation.isPending ? (
          <div className="py-6 flex justify-center items-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-200"></div>
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600 absolute top-0 left-0"></div>
            </div>
            <p className="text-neutral-600 ml-4">Analyzing contract...</p>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-indigo-50 to-neutral-50 rounded-lg border border-indigo-100 p-5">
            <ul className="space-y-3">
              {bulletPoints.map((point, index) => (
                <li key={index} className="flex items-start leading-tight">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center mr-3 mt-0.5 shrink-0">
                    <ChevronRight className="h-3.5 w-3.5 text-indigo-700" />
                  </div>
                  <span className="text-neutral-800">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}