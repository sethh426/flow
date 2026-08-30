"use client";
import { useEffect, useRef } from 'react';
import { useFlowBotTasks } from '@/contexts/FlowBotTasksContext';
import { usePathname, useRouter } from 'next/navigation';

// Maps suggestive onboarding tasks to selectors. Adjust selectors to match real UI.
const ONBOARDING_TASKS = [
  { title: 'Create your first product', targetSelector: 'a[href="/products"]' },
  { title: 'Explore workflow builder', targetSelector: 'a[href="/workflows"]' },
  { title: 'Check usage analytics', targetSelector: 'a[href="/usage"]' },
  { title: 'Find trending opportunities', targetSelector: 'a[href="/flow-finder"]' },
];

export const FlowBotOnboarding: React.FC = () => {
  const { tasks, addTask } = useFlowBotTasks();
  const initializedRef = useRef(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    // Only seed if no tasks yet
    if (tasks.length === 0) {
      ONBOARDING_TASKS.forEach(t => addTask({ title: t.title, targetSelector: t.targetSelector }));
    }
  }, [tasks, addTask]);

  // Example smart redirect if user lands on root and has onboarding tasks.
  useEffect(() => {
    if (pathname === '/' && tasks.length > 0) {
      // Could trigger FlowBot message or gentle nudge in future.
    }
  }, [pathname, tasks]);

  return null;
};
