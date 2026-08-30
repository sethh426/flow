"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getFirestore, collection, addDoc, doc, onSnapshot, updateDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { getApp } from 'firebase/app';
// Optional: if auth context exists, we can pull user id
// Replace with real auth hook if available
// import { useAuth } from '@/contexts/AuthContext';

export type FlowBotTaskStatus = 'pending' | 'in-progress' | 'completed';

export interface FlowBotTask {
  id: string;
  title: string;
  status: FlowBotTaskStatus;
  targetSelector?: string; // CSS selector of element FlowBot should move near
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
}

interface FlowBotTasksContextValue {
  tasks: FlowBotTask[];
  addTask: (task: Omit<FlowBotTask, 'id' | 'status' | 'createdAt'>) => string;
  startTask: (id: string) => void;
  completeTask: (id: string) => void;
  clearCompleted: () => void;
  reload: () => void;
}

const FlowBotTasksContext = createContext<FlowBotTasksContextValue | undefined>(undefined);

export const FlowBotTasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<FlowBotTask[]>([]);
  const [userId] = useState<string | null>(() => {
    // TODO: replace with real user id from auth context
    // const { user } = useAuth(); return user?.uid ?? null;
    return null;
  });
  const [db] = useState(() => {
    try { return getFirestore(getApp()); } catch { return null; }
  });

  const tasksCol = db && userId ? collection(db, 'users', userId, 'flowbot_tasks') : null;

  const reload = useCallback(() => {
    if (!tasksCol) return;
    const q = query(tasksCol);
    return onSnapshot(q, snap => {
      const loaded: FlowBotTask[] = [];
      snap.forEach(docSnap => {
        const d = docSnap.data();
        loaded.push({
          id: docSnap.id,
          title: d.title,
            status: d.status as FlowBotTaskStatus,
            targetSelector: d.targetSelector,
            createdAt: d.createdAt?.toMillis?.() ?? Date.now(),
            startedAt: d.startedAt?.toMillis?.(),
            completedAt: d.completedAt?.toMillis?.(),
        });
      });
      setTasks(loaded);
    });
  }, [tasksCol]);

  useEffect(() => {
    const unsub = reload();
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [reload]);

  const addTask = useCallback((task: Omit<FlowBotTask, 'id' | 'status' | 'createdAt'>) => {
    const id = crypto.randomUUID();
    const newTask: FlowBotTask = { ...task, id, status: 'pending', createdAt: Date.now() };
    setTasks((prev) => [...prev, newTask]);
    if (tasksCol) {
      addDoc(tasksCol, {
        title: newTask.title,
        status: newTask.status,
        targetSelector: newTask.targetSelector ?? null,
        createdAt: serverTimestamp(),
      }).catch(console.error);
    }
    return id;
  }, [tasksCol]);

  const startTask = useCallback((id: string) => {
    setTasks((prev) => prev.map(t => t.id === id && t.status === 'pending' ? { ...t, status: 'in-progress', startedAt: Date.now() } : t));
    if (tasksCol) {
      const ref = doc(tasksCol, id);
      updateDoc(ref, { status: 'in-progress', startedAt: serverTimestamp() }).catch(console.error);
    }
  }, [tasksCol]);

  const completeTask = useCallback((id: string) => {
    setTasks((prev) => prev.map(t => t.id === id && t.status !== 'completed' ? { ...t, status: 'completed', completedAt: Date.now() } : t));
    if (tasksCol) {
      const ref = doc(tasksCol, id);
      updateDoc(ref, { status: 'completed', completedAt: serverTimestamp() }).catch(console.error);
    }
  }, [tasksCol]);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => prev.filter(t => t.status !== 'completed'));
  }, []);

  return (
    <FlowBotTasksContext.Provider value={{ tasks, addTask, startTask, completeTask, clearCompleted, reload }}>
      {children}
    </FlowBotTasksContext.Provider>
  );
};

export const useFlowBotTasks = () => {
  const ctx = useContext(FlowBotTasksContext);
  if (!ctx) throw new Error('useFlowBotTasks must be used within FlowBotTasksProvider');
  return ctx;
};
