import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { FlowBotTasksProvider, useFlowBotTasks } from '@/contexts/FlowBotTasksContext';

describe('FlowBotTasksContext', () => {
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <FlowBotTasksProvider>{children}</FlowBotTasksProvider>
  );

  it('adds and manages task lifecycle', () => {
    const { result } = renderHook(() => useFlowBotTasks(), { wrapper });
    let id: string = '';
    act(() => {
      id = result.current.addTask({ title: 'Test Task', targetSelector: undefined });
    });
    expect(result.current.tasks.find(t => t.id === id)?.status).toBe('pending');
    act(() => { result.current.startTask(id); });
    expect(result.current.tasks.find(t => t.id === id)?.status).toBe('in-progress');
    act(() => { result.current.completeTask(id); });
    expect(result.current.tasks.find(t => t.id === id)?.status).toBe('completed');
  });
});
