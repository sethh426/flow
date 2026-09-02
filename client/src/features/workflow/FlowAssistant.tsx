'use client';

import { useEffect, useState } from 'react';
import FlowBotDialog from './FlowBotDialog';

export default function FlowAssistant() {
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const openAssistant = () => setDialogOpen(true);
    window.addEventListener('flow-assistant-open', openAssistant);
    return () => window.removeEventListener('flow-assistant-open', openAssistant);
  }, []);

  return <FlowBotDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />;
}
