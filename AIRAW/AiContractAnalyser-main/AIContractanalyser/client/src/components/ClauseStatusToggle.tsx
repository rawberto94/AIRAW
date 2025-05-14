import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ClauseType } from '@/types';
import { toast } from '@/hooks/use-toast';

interface ClauseStatusToggleProps {
  clause: ClauseType;
}

export function ClauseStatusToggle({ clause }: ClauseStatusToggleProps) {
  const queryClient = useQueryClient();
  
  const markAsCompleted = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/clauses/${id}/complete`, 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Clause marked as completed",
        description: "The clause has been marked as reviewed and completed."
      });
      
      // Invalidate clauses cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/clauses'] });
    },
    onError: (error) => {
      console.error('Error marking clause as completed:', error);
      toast({
        title: "Error",
        description: "Failed to mark clause as completed. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleChange = (checked: boolean) => {
    if (checked && clause.id) {
      markAsCompleted.mutate(clause.id);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id={`clause-${clause.id}-completed`}
        checked={clause.completed}
        disabled={clause.completed || markAsCompleted.isPending}
        onCheckedChange={handleChange}
      />
      <label 
        htmlFor={`clause-${clause.id}-completed`}
        className={`text-sm ${clause.completed ? 'text-green-600 font-medium' : 'text-gray-500'}`}
      >
        {clause.completed ? 'Completed' : 'Mark as completed'}
      </label>
    </div>
  );
}