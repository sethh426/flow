'use client';

import React from 'react';
import { Box } from '@mui/material';
import WorkflowBuilder from '@/features/workflow/WorkflowBuilder';
import { WorkflowDefinition } from '@/types/workflow';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function WorkflowsPage() {
  const handleSave = async (workflow: WorkflowDefinition) => {
    console.log('Saving workflow:', workflow);
    
    try {
      // Save to Firestore
      const workflowRef = await addDoc(collection(db, 'workflows'), {
        ...workflow,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'draft',
      });

      console.log('Workflow saved with ID:', workflowRef.id);
      toast.success(`Workflow "${workflow.name}" saved successfully!`);
      
      return workflowRef.id;
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
      throw error;
    }
  };

  const handleExecute = async (workflow: WorkflowDefinition) => {
    console.log('Executing workflow:', workflow);
    
    try {
      // Send to Workflow Executor service
      const response = await fetch('/api/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      });

      if (!response.ok) {
        throw new Error('Failed to execute workflow');
      }

      const data = await response.json();
      console.log('Workflow execution started:', data);
      
      toast.success(
        `Workflow "${workflow.name}" is now executing! ID: ${data.executionId}`,
        { duration: 5000 }
      );

      return data.executionId;
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow');
      throw error;
    }
  };

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <WorkflowBuilder onSave={handleSave} onExecute={handleExecute} />
    </Box>
  );
}
