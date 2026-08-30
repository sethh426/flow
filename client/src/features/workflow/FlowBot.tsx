
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Loader2, Send, Sparkles, X, Home, LayoutGrid, Clock, Package, TrendingUp, Rocket, Users, Briefcase, FileText, BarChart3, Plug, FolderTree, HelpCircle, ShieldCheck } from 'lucide-react';
import { askFlow, type FlowBotHistory } from '@/ai/flows/flow-bot-flow';
import { useFlowBotTasks } from '@/contexts/FlowBotTasksContext';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const navItems = [
  { href: '/flow-finder', label: 'Flow-Finder', icon: TrendingUp },
  { href: '/flow-a-gram', label: 'Flow-a-Gram', icon: FileText },
  { href: '/flowtime', label: 'FlowTime', icon: Clock },
  { href: '/workflows', label: 'Workflow Builder', icon: Rocket },
  { href: '/project-hub', label: 'Projects', icon: Package },
  { href: '/products', label: 'Products', icon: LayoutGrid },
  { href: '/analysis', label: 'AI Project Launchpad', icon: Rocket },
  { href: '/audience', label: 'AI Audience Finder', icon: Users },
  { href: '/brand-ambassador', label: 'AI Brand Ambassador', icon: Briefcase },
  { href: '/usage', label: 'Usage Analytics', icon: BarChart3 },
  { href: '/connections', label: 'Connections', icon: Plug },
  { href: '/structure', label: 'Code Structure', icon: FolderTree },
  { href: '/about', label: 'About & FAQ', icon: HelpCircle },
];


export function FlowBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<FlowBotHistory[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  // Draggable state
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: window.innerWidth - 120, y: window.innerHeight - 140 });
  const dragRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const offsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Tasks
  const { tasks, startTask, completeTask, addTask } = useFlowBotTasks();
  const router = useRouter();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const activeTask = tasks.find(t => t.id === activeTaskId);

  const beginTask = useCallback((id: string) => {
    startTask(id);
    setActiveTaskId(id);
    const task = tasks.find(t => t.id === id);
    if (task?.targetSelector) {
      const linkHrefMatch = /href=\"(\/[^\"]*)\"/.exec(task.targetSelector);
      // If selector indicates a link href and element not yet present, navigate
      if (linkHrefMatch && !document.querySelector(task.targetSelector)) {
        router.push(linkHrefMatch[1]);
      }
    }
  }, [startTask, tasks, router]);

  // Auto-complete simple tasks when user reaches page (example heuristic)
  useEffect(() => {
    if (!activeTask) return;
    if (activeTask.status === 'in-progress' && activeTask.targetSelector) {
      const el = document.querySelector(activeTask.targetSelector);
      if (el) {
        // If element is a button and clicked, mark done
        const handleClick = () => finishTask(activeTask.id);
        el.addEventListener('click', handleClick, { once: true });
        return () => { el.removeEventListener('click', handleClick); };
      }
    }
  }, [activeTask, finishTask]);

  const finishTask = useCallback((id: string) => {
    completeTask(id);
    if (activeTaskId === id) setActiveTaskId(null);
  }, [completeTask, activeTaskId]);

  useEffect(() => {
    // Scroll to the bottom whenever the history changes
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [history]);

  // Auto-move toward target element for active task
  useEffect(() => {
    if (!activeTask || !activeTask.targetSelector) return;
    const el = document.querySelector(activeTask.targetSelector) as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    // Move FlowBot near target smoothly
    const targetPos = { x: rect.right + 20, y: rect.top + 20 };
    let animationFrame: number;
    const animate = () => {
      setPosition(prev => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 2) return targetPos;
        const step = 0.12; // easing factor
        return { x: prev.x + dx * step, y: prev.y + dy * step };
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [activeTask]);

  // Drag handlers
  useEffect(() => {
    let rAF: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      if (rAF) cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => {
        setPosition(prev => {
          const newX = e.clientX - offsetRef.current.x;
          const newY = e.clientY - offsetRef.current.y;
          const clampedX = Math.min(Math.max(20, newX), window.innerWidth - 120);
          const clampedY = Math.min(Math.max(20, newY), window.innerHeight - 120);
          return { x: clampedX, y: clampedY };
        });
      });
    };
    const handleMouseUp = () => { isDraggingRef.current = false; };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (rAF) cancelAnimationFrame(rAF);
    };
  }, []);

  const startDrag = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    const rect = dragRef.current?.getBoundingClientRect();
    offsetRef.current = { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim() || isThinking) return;

    const userMessage: FlowBotHistory = { role: 'user', text: message };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setMessage('');
    setIsThinking(true);

    try {
      // Simple intent parsing -> task creation
      const lower = message.toLowerCase();
      if (lower.includes('create') && lower.includes('product')) {
        addTask({ title: 'Add a new product', targetSelector: 'a[href="/products"]' });
      }
      if (lower.includes('workflow') || lower.includes('automation')) {
        addTask({ title: 'Open workflow builder', targetSelector: 'a[href="/workflows"]' });
      }
      if (lower.includes('analytics') || lower.includes('usage')) {
        addTask({ title: 'View usage analytics', targetSelector: 'a[href="/usage"]' });
      }
      if (lower.includes('trend') || lower.includes('find opportunities')) {
        addTask({ title: 'Check Flow-Finder trends', targetSelector: 'a[href="/flow-finder"]' });
      }
      const stream = await askFlow({
        question: message,
        history: history, // Send history *before* the current message
      });

      let responseText = '';
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      // Add a placeholder for the model's response
      setHistory((prev) => [...prev, { role: 'model', text: '...' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        responseText += decoder.decode(value, { stream: true });
        // Update the last message in history (which is the model's)
        setHistory((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'model', text: responseText };
          return updated;
        });
      }
    } catch (error) {
      console.error('Error asking Flow:', error);
      const errorMessage: FlowBotHistory = {
        role: 'model',
        text: "I'm sorry, I seem to be having trouble connecting. Please try again in a moment.",
      };
      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Active Task Target Highlight */}
      {activeTask?.targetSelector && (
        <TargetHighlight selector={activeTask.targetSelector} />
      )}
      {/* Draggable Floating Agent */}
      <div
        ref={dragRef}
        className="flowbot-draggable fixed z-[9999] cursor-pointer select-none"
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        onMouseDown={startDrag}
        onDoubleClick={() => setIsOpen(true)}
        aria-label="FlowBot draggable agent"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            setIsOpen(true);
            e.preventDefault();
          }
          const step = 24;
          if (e.key === 'ArrowLeft') setPosition(p => ({ ...p, x: Math.max(0, p.x - step) }));
          if (e.key === 'ArrowRight') setPosition(p => ({ ...p, x: Math.min(window.innerWidth - 120, p.x + step) }));
          if (e.key === 'ArrowUp') setPosition(p => ({ ...p, y: Math.max(0, p.y - step) }));
          if (e.key === 'ArrowDown') setPosition(p => ({ ...p, y: Math.min(window.innerHeight - 120, p.y + step) }));
        }}
      >
        <div className="relative">
          <Button
            size="icon"
            className="rounded-full w-16 h-16 shadow-2xl p-0 animate-pulse-slow"
            onClick={() => setIsOpen(true)}
            aria-label="Open Flow Assistant"
            data-testid="flowbot-fab-button"
          >
            <Avatar className="w-full h-full">
              <AvatarImage src="/flow-avatar.png" alt="Flow Assistant" />
              <AvatarFallback>
                <Sparkles />
              </AvatarFallback>
            </Avatar>
          </Button>
          {activeTask && (
            <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] px-2 py-1 rounded-full shadow-md" title={activeTask.title}>
              Working
            </div>
          )}
        </div>
      </div>

      {/* Chat Sheet */}
      <Sheet open={isOpen} onClose={() => setIsOpen(false)}>
        <SheetContent className="flex flex-col" data-testid="flowbot-chat-panel">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2" data-testid="flowbot-title">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/flow-avatar.png" alt="Flow" />
                <AvatarFallback>
                  <Bot />
                </AvatarFallback>
              </Avatar>
              Flow Assistant
            </SheetTitle>
            <SheetDescription data-testid="flowbot-description">
              Your guide to AffiliateFlow. Drag me around. Double‑click to open. Active tasks move me near relevant UI.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef} data-testid="flowbot-conversation">
            <div className="space-y-4">
              {history.length === 0 && (
                 <div className="p-4 text-center text-muted-foreground text-sm" data-testid="flowbot-welcome-message">
                    <p>Welcome! I&apos;m Flow. How can I help you get started?</p>
                </div>
              )}
              {history.map((entry, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    entry.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                  data-testid={`flowbot-message-${entry.role}-${index}`}
                  role="log"
                  aria-label={`${entry.role === 'user' ? 'User' : 'Assistant'} message`}
                >
                  {entry.role === 'model' && (
                    <Avatar className="w-6 h-6 border">
                      <AvatarImage src="/flow-avatar.png" />
                      <AvatarFallback>
                        <Bot />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-xs rounded-lg px-3 py-2 text-sm',
                      entry.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {entry.text}
                  </div>
                </div>
              ))}
              {isThinking && history[history.length - 1]?.role === 'user' && (
                <div className="flex items-start gap-3 justify-start" data-testid="flowbot-thinking-indicator">
                   <Avatar className="w-6 h-6 border">
                      <AvatarImage src="/flow-avatar.png" />
                      <AvatarFallback>
                        <Bot />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                </div>
              )}
            </div>
             <div className="mt-6">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2" data-testid="flowbot-menu-title">Application Menu</h3>
                <div className="grid grid-cols-2 gap-2" data-testid="flowbot-navigation-menu">
                    {navItems.map((item) => (
                        <Button 
                          key={item.href} 
                          variant="ghost" 
                          asChild 
                          className="justify-start" 
                          onClick={() => setIsOpen(false)}
                          data-testid={`flowbot-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                             <Link href={item.href}>
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </Link>
                        </Button>
                    ))}
                </div>
            </div>
            {/* Task Panel */}
            <div className="mt-8">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Tasks</h3>
              <div className="space-y-2">
                {tasks.length === 0 && <p className="text-xs text-muted-foreground">No tasks yet.</p>}
                {tasks.map(t => (
                  <div key={t.id} className={cn('text-xs px-2 py-2 rounded border flex items-center justify-between',
                    t.status === 'completed' ? 'bg-green-50 border-green-300 text-green-700' : t.status === 'in-progress' ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-muted border-border')}> 
                    <span className="truncate max-w-[140px]" title={t.title}>{t.title}</span>
                    <div className="flex gap-1">
                      {t.status === 'pending' && <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => beginTask(t.id)}>Start</Button>}
                      {t.status === 'in-progress' && <Button size="sm" variant="outline" className="h-6 px-2" onClick={() => finishTask(t.id)}>Done</Button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
          <SheetFooter>
            <form onSubmit={handleSubmit} className="flex w-full items-center gap-2" data-testid="flowbot-input-form">
              <Input
                type="text"
                placeholder="e.g., How do I find trends?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isThinking}
                data-testid="flowbot-message-input"
                aria-label="Message input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.altKey && message.trim()) {
                    addTask({ title: message.trim().slice(0,40), targetSelector: undefined });
                    setMessage('');
                    e.preventDefault();
                  }
                }}
              />
              <Button 
                type="submit" 
                disabled={isThinking || !message.trim()}
                data-testid="flowbot-send-button"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}

// Lightweight component for rendering a highlight around the target element of the active task.
const TargetHighlight: React.FC<{ selector: string }> = ({ selector }) => {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;
    const update = () => setRect(el.getBoundingClientRect());
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      obs.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [selector]);
  if (!rect) return null;
  return (
    <div
      aria-label="FlowBot task target highlight"
      className="pointer-events-none fixed z-[9998] flowbot-target-highlight"
      style={{
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      }}
    >
      <div className="absolute inset-0 rounded-xl border-2 border-primary animate-pulse-slow shadow-[0_0_0_4px_rgba(99,102,241,0.15)]" />
    </div>
  );
};
