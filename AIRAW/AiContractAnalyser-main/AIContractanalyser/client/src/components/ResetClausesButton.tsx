import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RefreshCcw, AlertTriangle } from 'lucide-react';

export default function ResetClausesButton() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const resetClausesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', '/api/clauses/reset', {});
    },
    onSuccess: () => {
      // Invalidate the clauses query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/clauses'] });
      toast({
        title: 'Clauses reset',
        description: 'All analyzed clauses have been reset successfully.',
      });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error resetting clauses',
        description: error.message || 'Failed to reset clauses',
        variant: 'destructive',
      });
      setIsDialogOpen(false);
    },
  });

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Reset Clauses
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center">
            <div className="mr-2 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="text-red-600 h-5 w-5" />
            </div>
            <AlertDialogTitle>Reset All Analyzed Clauses</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            This action will delete all analyzed clauses from the database. 
            This cannot be undone. Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-red-200">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
            onClick={(e) => {
              e.preventDefault();
              resetClausesMutation.mutate();
            }}
            disabled={resetClausesMutation.isPending}
          >
            {resetClausesMutation.isPending ? (
              <>
                <RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Clauses'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}