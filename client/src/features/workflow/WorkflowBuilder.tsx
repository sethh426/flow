'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  Panel,
  Handle,
  Position,
  ConnectionLineType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Box,
  Button,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Alert,
  Card,
} from '@mui/material';
import {
  Add as AddIcon,
  Save as SaveIcon,
  PlayArrow as PlayIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  Bolt as BoltIcon,
  Webhook as WebhookIcon,
  TouchApp as TouchAppIcon,
  Image as ImageIcon,
  Send as SendIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
  Timer as TimerIcon,
  FilterList,
} from '@mui/icons-material';
import { WorkflowDefinition, WorkflowStage, ProductType, WorkflowStatus } from '@/types/workflow';
import workflowTemplates from '@/data/workflowTemplates';
import NodeConfigPanel from './NodeConfigPanel';
import { useAuth } from '@/contexts/AuthContext';
import { WorkflowExecutor } from '@/services/workflow-executor';

// Custom node components
const TriggerNode = ({ data }: any) => {
  const isExecuting = data.executionStatus === 'executing';
  const isCompleted = data.executionStatus === 'completed';
  const isFailed = data.executionStatus === 'failed';
  
  return (
  <>
    <Handle 
      type="target" 
      position={Position.Left} 
      style={{ 
        background: '#8b9dff',
        width: '12px',
        height: '12px',
        border: '2px solid white',
        cursor: 'crosshair'
      }} 
    />
    <Handle 
      type="source" 
      position={Position.Right} 
      style={{ 
        background: '#8b9dff',
        width: '12px',
        height: '12px',
        border: '2px solid white',
        cursor: 'crosshair'
      }} 
    />
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        background: isCompleted 
          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          : isFailed
          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        minWidth: 200,
        boxShadow: isExecuting ? 6 : 3,
        border: isExecuting 
          ? '2px solid #fbbf24' 
          : isCompleted
          ? '2px solid #10b981'
          : isFailed
          ? '2px solid #ef4444'
          : '2px solid #5a67d8',
        transition: 'all 0.3s ease',
        animation: isExecuting ? 'pulse 1.5s ease-in-out infinite' : 'none',
        '@keyframes pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(251, 191, 36, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(251, 191, 36, 0)' },
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          border: '2px solid #8b9dff',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <BoltIcon fontSize="small" />
        <Typography variant="subtitle2" fontWeight="bold">TRIGGER</Typography>
      </Box>
      <Typography variant="body2">{data.label}</Typography>
      {data.triggerType && (
        <Chip
          label={data.triggerType}
          size="small"
          sx={{ mt: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}
        />
      )}
    </Box>
  </>
  );
};

const ActionNode = ({ data }: any) => {
  const isExecuting = data.executionStatus === 'executing';
  const isCompleted = data.executionStatus === 'completed';
  const isFailed = data.executionStatus === 'failed';
  
  return (
  <>
    <Handle 
      type="target" 
      position={Position.Left} 
      style={{ 
        background: '#ff6bb3',
        width: '12px',
        height: '12px',
        border: '2px solid white',
        cursor: 'crosshair'
      }} 
    />
    <Handle 
      type="source" 
      position={Position.Right} 
      style={{ 
        background: '#ff6bb3',
        width: '12px',
        height: '12px',
        border: '2px solid white',
        cursor: 'crosshair'
      }} 
    />
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        background: isCompleted 
          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
          : isFailed
          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
          : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        minWidth: 200,
        boxShadow: isExecuting ? 6 : 3,
        border: isExecuting 
          ? '2px solid #fbbf24' 
          : isCompleted
          ? '2px solid #10b981'
          : isFailed
          ? '2px solid #ef4444'
          : '2px solid #ec4899',
        transition: 'all 0.3s ease',
        animation: isExecuting ? 'pulse 1.5s ease-in-out infinite' : 'none',
        '@keyframes pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(251, 191, 36, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(251, 191, 36, 0)' },
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          border: '2px solid #ff6bb3',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <SettingsIcon fontSize="small" />
        <Typography variant="subtitle2" fontWeight="bold">ACTION</Typography>
      </Box>
      <Typography variant="body2">{data.label}</Typography>
      {data.actionType && (
        <Chip
          label={data.actionType}
          size="small"
          sx={{ mt: 1, backgroundColor: 'rgba(255,255,255,0.2)' }}
        />
      )}
    </Box>
  </>
  );
};

const ConditionNode = ({ data }: any) => {
  const isExecuting = data.executionStatus === 'executing';
  const isCompleted = data.executionStatus === 'completed';
  const isFailed = data.executionStatus === 'failed';
  
  return (
  <>
    <Handle 
      type="target" 
      position={Position.Left} 
      style={{ 
        background: '#fbbf24',
        width: '12px',
        height: '12px',
        border: '2px solid white',
        cursor: 'crosshair'
      }} 
    />
    <Handle 
      type="source" 
      position={Position.Right} 
      id="true"
      style={{ 
        background: '#10b981',
        width: '12px',
        height: '12px',
        border: '2px solid white',
        cursor: 'crosshair',
        top: '35%'
      }} 
    />
    <Handle 
      type="source" 
      position={Position.Right} 
      id="false" 
      style={{ 
        background: '#ef4444',
        width: '12px',
        height: '12px',
        border: '2px solid white',
        cursor: 'crosshair',
        top: '65%'
      }} 
    />
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        background: isCompleted 
          ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
          : isFailed
          ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
          : 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        color: isCompleted ? '#065f46' : isFailed ? '#991b1b' : '#92400e',
        minWidth: 200,
        boxShadow: isExecuting ? 6 : 3,
        border: isExecuting 
          ? '2px solid #fbbf24' 
          : isCompleted
          ? '2px solid #10b981'
          : isFailed
          ? '2px solid #ef4444'
          : '2px solid #f59e0b',
        transition: 'all 0.3s ease',
        animation: isExecuting ? 'pulse 1.5s ease-in-out infinite' : 'none',
        '@keyframes pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(251, 191, 36, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(251, 191, 36, 0)' },
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          border: '2px solid #fbbf24',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <ApiIcon fontSize="small" sx={{ color: '#d97706' }} />
        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#92400e' }}>CONDITION</Typography>
      </Box>
      <Typography variant="body2" sx={{ color: '#78350f' }}>{data.label}</Typography>
    </Box>
  </>
  );
};

const StageNode = ({ data }: any) => {
  const isExecuting = data.executionStatus === 'executing';
  const isCompleted = data.executionStatus === 'completed';
  const isFailed = data.executionStatus === 'failed';
  
  return (
  <>
    <Handle 
      type="target" 
      position={Position.Left} 
      style={{ 
        background: '#22d3ee',
        width: '12px',
        height: '12px',
        border: '2px solid white',
        cursor: 'crosshair'
      }} 
    />
    <Handle 
      type="target" 
      position={Position.Top} 
      style={{ 
        background: '#22d3ee',
        width: '12px',
        height: '12px',
        border: '2px solid white',
        cursor: 'crosshair'
      }} 
    />
    <Handle 
      type="source" 
      position={Position.Right} 
      style={{ 
        background: '#22d3ee',
        width: '12px',
        height: '12px',
        border: '2px solid white',
        cursor: 'crosshair'
      }} 
    />
    <Handle 
      type="source" 
      position={Position.Bottom} 
      style={{ 
        background: '#22d3ee',
        width: '12px',
        height: '12px',
        border: '2px solid white',
        cursor: 'crosshair'
      }} 
    />
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        background: isCompleted 
          ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
          : isFailed
          ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
          : 'linear-gradient(135deg, #cffafe 0%, #e0f2fe 100%)',
        color: isCompleted ? '#065f46' : isFailed ? '#991b1b' : '#164e63',
        minWidth: 250,
        boxShadow: isExecuting ? 6 : 3,
        border: isExecuting 
          ? '2px solid #fbbf24' 
          : isCompleted
          ? '2px solid #10b981'
          : isFailed
          ? '2px solid #ef4444'
          : '2px solid #06b6d4',
        transition: 'all 0.3s ease',
        animation: isExecuting ? 'pulse 1.5s ease-in-out infinite' : 'none',
        '@keyframes pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(251, 191, 36, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(251, 191, 36, 0)' },
        },
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
          border: '2px solid #22d3ee',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <StorageIcon fontSize="small" sx={{ color: '#0891b2' }} />
        <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#164e63' }}>STAGE {data.order}</Typography>
      </Box>
      <Typography variant="body1" fontWeight="bold" sx={{ color: '#155e75' }}>{data.label}</Typography>
      {data.description && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.8, color: '#0e7490' }}>
          {data.description}
        </Typography>
      )}
    </Box>
  </>
  );
};

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  stage: StageNode,
};

interface WorkflowBuilderProps {
  initialWorkflow?: WorkflowDefinition;
  onSave?: (workflow: WorkflowDefinition) => void;
  onExecute?: (workflow: WorkflowDefinition) => void;
}

export default function WorkflowBuilder({
  initialWorkflow,
  onSave,
  onExecute,
}: WorkflowBuilderProps) {
  const { user } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [recommendedTemplates, setRecommendedTemplates] = useState<string[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('New Workflow');
  const [productType, setProductType] = useState<ProductType>('physical');
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>('draft');
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [showExecutionDialog, setShowExecutionDialog] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [saveTemplateDialogOpen, setSaveTemplateDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [executingNodes, setExecutingNodes] = useState<Set<string>>(new Set());
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [failedNodes, setFailedNodes] = useState<Set<string>>(new Set());
  const [currentExecutingNode, setCurrentExecutingNode] = useState<string | null>(null);

  // Advanced Workflow Features
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [conditionalDialogOpen, setConditionalDialogOpen] = useState(false);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] as string[] });
  const [newSchedule, setNewSchedule] = useState({ name: '', frequency: 'daily', time: '09:00', enabled: true });
  const [conditionalRules, setConditionalRules] = useState<any[]>([]);

  // Validate workflow
  const validateWorkflow = useCallback(() => {
    const warnings: string[] = [];

    // Check for unconnected nodes
    const connectedNodeIds = new Set<string>();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });

    const unconnectedNodes = nodes.filter(node => 
      node.type !== 'stage' && !connectedNodeIds.has(node.id)
    );

    if (unconnectedNodes.length > 0) {
      warnings.push(`⚠️ ${unconnectedNodes.length} unconnected node(s) - workflow may not execute properly`);
    }

    // Check for trigger nodes
    const triggerNodes = nodes.filter(n => n.type === 'trigger');
    if (triggerNodes.length === 0) {
      warnings.push('⚠️ No trigger nodes - workflow needs at least one trigger to start');
    }

    // Check for action nodes
    const actionNodes = nodes.filter(n => n.type === 'action');
    if (actionNodes.length === 0) {
      warnings.push('⚠️ No action nodes - workflow needs at least one action to perform');
    }

    // Check for empty workflow name
    if (!workflowName || workflowName.trim() === '' || workflowName === 'New Workflow') {
      warnings.push('⚠️ Workflow name not set - give your workflow a meaningful name');
    }

    setValidationWarnings(warnings);
    return warnings;
  }, [nodes, edges, workflowName]);

  // Advanced Workflow Handlers
  const handleAddWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) {
      alert('Please provide webhook name and URL');
      return;
    }
    
    const webhook = {
      id: `webhook_${Date.now()}`,
      ...newWebhook,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    
    setWebhooks(prev => [...prev, webhook]);
    setNewWebhook({ name: '', url: '', events: [] });
    setWebhookDialogOpen(false);
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
  };

  const handleAddSchedule = () => {
    if (!newSchedule.name) {
      alert('Please provide schedule name');
      return;
    }
    
    const schedule = {
      id: `schedule_${Date.now()}`,
      ...newSchedule,
      createdAt: new Date().toISOString(),
      nextRun: calculateNextRun(newSchedule.frequency, newSchedule.time),
    };
    
    setSchedules(prev => [...prev, schedule]);
    setNewSchedule({ name: '', frequency: 'daily', time: '09:00', enabled: true });
    setScheduleDialogOpen(false);
  };

  const calculateNextRun = (frequency: string, time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const next = new Date(now);
    next.setHours(hours, minutes, 0, 0);
    
    if (frequency === 'daily') {
      if (next <= now) next.setDate(next.getDate() + 1);
    } else if (frequency === 'weekly') {
      if (next <= now) next.setDate(next.getDate() + 7);
    } else if (frequency === 'hourly') {
      next.setHours(now.getHours() + 1);
    }
    
    return next.toLocaleString();
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const handleToggleSchedule = (id: string) => {
    setSchedules(prev => prev.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const handleAddConditionalRule = () => {
    const rule = {
      id: `rule_${Date.now()}`,
      condition: 'if',
      field: '',
      operator: 'equals',
      value: '',
      action: 'continue',
    };
    
    setConditionalRules(prev => [...prev, rule]);
  };

  const handleDeleteConditionalRule = (id: string) => {
    setConditionalRules(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdateConditionalRule = (id: string, updates: any) => {
    setConditionalRules(prev => prev.map(r => 
      r.id === id ? { ...r, ...updates } : r
    ));
  };

  // Run validation when nodes or edges change
  useEffect(() => {
    validateWorkflow();
  }, [nodes, edges, workflowName, validateWorkflow]);

  // Load initial workflow or template
  useEffect(() => {
    if (initialWorkflow) {
      loadWorkflowToCanvas(initialWorkflow);
    }
  }, [initialWorkflow]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Delete key - delete selected nodes
      if (event.key === 'Delete' && selectedNode) {
        handleNodeDelete(selectedNode.id);
        event.preventDefault();
      }

      // Ctrl/Cmd + S - Save (call save directly from here)
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (!isSaving && user) {
          // Trigger save
          const workflow = convertNodesToWorkflow();
          onSave?.(workflow);
        }
      }

      // Ctrl/Cmd + E - Execute (call execute directly from here)
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        if (!isExecuting && user) {
          // Trigger execute
          const workflow = convertNodesToWorkflow();
          onExecute?.(workflow);
        }
      }

      // Ctrl/Cmd + D - Duplicate selected node
      if ((event.ctrlKey || event.metaKey) && event.key === 'd' && selectedNode) {
        const newNode: Node = {
          ...selectedNode,
          id: `${selectedNode.type}-${Date.now()}`,
          position: {
            x: selectedNode.position.x + 50,
            y: selectedNode.position.y + 50,
          },
        };
        setNodes((nds) => [...nds, newNode]);
        event.preventDefault();
      }

      // Escape - Close panels
      if (event.key === 'Escape') {
        setConfigPanelOpen(false);
        setTemplateDialogOpen(false);
        setSelectedNode(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, isSaving, isExecuting, user, onSave, onExecute, nodes, edges]);

  // Convert workflow definition to React Flow nodes/edges
  const loadWorkflowToCanvas = (workflow: WorkflowDefinition) => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    let yOffset = 0;

    workflow.stages.forEach((stage, stageIndex) => {
      // Create stage node
      const stageNode: Node = {
        id: `stage-${stage.id}`,
        type: 'stage',
        position: { x: 50, y: yOffset },
        data: {
          label: stage.name,
          description: stage.description,
          order: stage.order,
        },
      };
      newNodes.push(stageNode);

      let xOffset = 300;

      // Create trigger nodes
      stage.triggers.forEach((trigger, triggerIndex) => {
        const triggerNode: Node = {
          id: `trigger-${stage.id}-${triggerIndex}`,
          type: 'trigger',
          position: { x: xOffset, y: yOffset },
          data: {
            label: trigger.type,
            triggerType: trigger.type,
          },
        };
        newNodes.push(triggerNode);

        // Connect stage to trigger
        newEdges.push({
          id: `edge-stage-trigger-${stage.id}-${triggerIndex}`,
          source: stageNode.id,
          target: triggerNode.id,
          animated: true,
        });

        xOffset += 250;
      });

      yOffset += 150;

      // Create action nodes
      stage.actions.forEach((action, actionIndex) => {
        const actionNode: Node = {
          id: `action-${stage.id}-${actionIndex}`,
          type: 'action',
          position: { x: 300 + (actionIndex * 250), y: yOffset },
          data: {
            label: action.name || action.type,
            actionType: action.type,
          },
        };
        newNodes.push(actionNode);

        // Connect previous action to this one
        if (actionIndex > 0) {
          newEdges.push({
            id: `edge-action-${stage.id}-${actionIndex}`,
            source: `action-${stage.id}-${actionIndex - 1}`,
            target: actionNode.id,
          });
        } else {
          // Connect first trigger to first action
          if (stage.triggers.length > 0) {
            newEdges.push({
              id: `edge-trigger-action-${stage.id}-${actionIndex}`,
              source: `trigger-${stage.id}-0`,
              target: actionNode.id,
              animated: true,
            });
          }
        }
      });

      yOffset += 150;

      // Create condition nodes
      stage.conditions.forEach((condition, conditionIndex) => {
        const conditionNode: Node = {
          id: `condition-${stage.id}-${conditionIndex}`,
          type: 'condition',
          position: { x: 300, y: yOffset },
          data: {
            label: `${condition.field} ${condition.operator} ${condition.value}`,
          },
        };
        newNodes.push(conditionNode);

        yOffset += 100;
      });

      yOffset += 50; // Space between stages
    });

    setNodes(newNodes);
    setEdges(newEdges);
    setWorkflowName(workflow.name);
    setProductType(workflow.productType);
    setWorkflowStatus(workflow.status);
  };

  // Handle new connections with improved styling
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#8b5cf6', strokeWidth: 2 },
      type: 'smoothstep',
    }, eds)),
    [setEdges]
  );

  // Add new node
  const addNode = (type: 'trigger' | 'action' | 'condition' | 'stage') => {
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: {
        x: Math.random() * 400,
        y: Math.random() * 400,
      },
      data: {
        label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // Handle node click - open config panel
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setConfigPanelOpen(true);
  }, []);

  // Save node configuration
  const handleNodeSave = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      )
    );
  }, [setNodes]);

  // Delete node
  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  // Convert nodes/edges back to WorkflowDefinition
  const convertNodesToWorkflow = (): WorkflowDefinition => {
    const stageNodes = nodes.filter(n => n.type === 'stage');
    const triggerNodes = nodes.filter(n => n.type === 'trigger');
    const actionNodes = nodes.filter(n => n.type === 'action');
    const conditionNodes = nodes.filter(n => n.type === 'condition');

    // Group nodes by stage (or create default stage if none exist)
    const stages: WorkflowStage[] = [];

    if (stageNodes.length === 0) {
      // Create a default stage with all nodes
      const defaultStage: WorkflowStage = {
        id: 'stage-1',
        name: 'Main Stage',
        description: 'Auto-generated stage',
        order: 1,
        triggers: triggerNodes.map((node) => ({
          id: node.id,
          type: (node.data.triggerType as any) || 'manual',
          config: {
            type: (node.data.triggerType as any) || 'manual',
            cronExpression: node.data.cronExpression,
            webhookUrl: node.data.webhookUrl,
            eventType: node.data.eventType,
          } as any,
          enabled: true,
        })),
        actions: actionNodes.map((node, index) => ({
          id: node.id,
          type: (node.data.actionType as any) || 'generate_content',
          name: (node.data.label as string) || `Action ${index + 1}`,
          config: {
            contentType: node.data.contentType,
            promptTemplate: node.data.promptTemplate,
            searchQuery: node.data.searchQuery,
            maxResults: node.data.maxResults,
            source: node.data.source,
            toEmail: node.data.toEmail,
            subject: node.data.subject,
            bodyTemplate: node.data.bodyTemplate,
            caption: node.data.caption,
            imageUrl: node.data.imageUrl,
            delayMinutes: node.data.delayMinutes,
            method: node.data.method,
            url: node.data.url,
            requestBody: node.data.requestBody,
          },
        })),
        conditions: conditionNodes.map((node) => ({
          id: node.id,
          field: (node.data.field as string) || '',
          operator: (node.data.operator as any) || 'equals',
          value: node.data.value || '',
        })),
        settings: {
          continueOnError: false,
          parallel: false,
        },
      };
      stages.push(defaultStage);
    } else {
      // Group by existing stages
      stageNodes.forEach((stageNode, stageIndex) => {
        // Find triggers connected to this stage
        const stageTriggersEdges = edges.filter(e => e.source === stageNode.id && triggerNodes.some(t => t.id === e.target));
        const stageTriggers = stageTriggersEdges.map(e => triggerNodes.find(t => t.id === e.target)!);

        // Find actions for this stage (actions at similar Y position or connected)
        const stageY = stageNode.position.y;
        const stageActions = actionNodes.filter(a => 
          Math.abs(a.position.y - stageY) < 200 || 
          edges.some(e => e.source === stageNode.id && e.target === a.id)
        );

        // Find conditions for this stage
        const stageConditions = conditionNodes.filter(c => 
          Math.abs(c.position.y - stageY) < 200
        );

        const stage: WorkflowStage = {
          id: stageNode.id,
          name: (stageNode.data.label as string) || `Stage ${stageIndex + 1}`,
          description: (stageNode.data.description as string) || '',
          order: (stageNode.data.order as number) || stageIndex + 1,
          triggers: stageTriggers.map((node) => ({
            id: node.id,
            type: (node.data.triggerType as any) || 'manual',
            config: {
              type: (node.data.triggerType as any) || 'manual',
              cronExpression: node.data.cronExpression,
              webhookUrl: node.data.webhookUrl,
              eventType: node.data.eventType,
            } as any,
            enabled: true,
          })),
          actions: stageActions.map((node, index) => ({
            id: node.id,
            type: (node.data.actionType as any) || 'generate_content',
            name: (node.data.label as string) || `Action ${index + 1}`,
            config: {
              contentType: node.data.contentType,
              promptTemplate: node.data.promptTemplate,
              searchQuery: node.data.searchQuery,
              maxResults: node.data.maxResults,
              source: node.data.source,
              toEmail: node.data.toEmail,
              subject: node.data.subject,
              bodyTemplate: node.data.bodyTemplate,
              caption: node.data.caption,
              imageUrl: node.data.imageUrl,
              delayMinutes: node.data.delayMinutes,
              method: node.data.method,
              url: node.data.url,
              requestBody: node.data.requestBody,
            },
          })),
          conditions: stageConditions.map((node) => ({
            id: node.id,
            field: (node.data.field as string) || '',
            operator: (node.data.operator as any) || 'equals',
            value: node.data.value || '',
          })),
          settings: {
            continueOnError: false,
            parallel: false,
          },
        };
        stages.push(stage);
      });
    }

    return {
      id: initialWorkflow?.id || `workflow-${Date.now()}`,
      userId: initialWorkflow?.userId || 'current-user',
      name: workflowName,
      productType,
      status: workflowStatus,
      stages,
      metadata: {
        automationLevel: calculateAutomationLevel(stages),
        successRate: initialWorkflow?.metadata?.successRate || 0,
        executionCount: initialWorkflow?.metadata?.executionCount || 0,
        tags: initialWorkflow?.metadata?.tags || [],
        category: initialWorkflow?.metadata?.category || 'Custom',
      },
      createdAt: initialWorkflow?.createdAt || new Date(),
      updatedAt: new Date(),
    };
  };

  // Calculate automation level based on workflow complexity
  const calculateAutomationLevel = (stages: WorkflowStage[]): number => {
    let score = 0;
    stages.forEach(stage => {
      // Automated triggers increase score
      if (stage.triggers.some(t => t.type === 'scheduled' || t.type === 'webhook')) {
        score += 30;
      }
      // Multiple actions increase automation
      score += Math.min(stage.actions.length * 10, 40);
      // Conditions add intelligence
      score += Math.min(stage.conditions.length * 15, 30);
    });
    return Math.min(score, 100);
  };

  // Save workflow to Firebase
  const handleSave = async () => {
    if (!user?.uid) {
      alert('Please sign in to save workflows');
      return;
    }

    setIsSaving(true);
    try {
      const workflow = convertNodesToWorkflow();
      
      // Update or create workflow in Firebase
      if (workflowId) {
        // Update existing workflow
        const response = await fetch('/api/workflows', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...workflow, id: workflowId }),
        });

        if (!response.ok) {
          throw new Error('Failed to update workflow');
        }

        const data = await response.json();
        console.log('Workflow updated:', data);
        alert('Workflow saved successfully! ✅');
      } else {
        // Create new workflow
        const response = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...workflow, userId: user.uid }),
        });

        if (!response.ok) {
          throw new Error('Failed to create workflow');
        }

        const data = await response.json();
        setWorkflowId(data.workflowId || data.workflow?.id);
        console.log('Workflow created:', data);
        alert('Workflow saved successfully! ✅');
      }

      // Call parent callback if provided
      if (onSave) {
        onSave(workflow);
      }
    } catch (error: any) {
      console.error('Error saving workflow:', error);
      alert(`Failed to save workflow: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };


  // Execute workflow
  const handleExecute = async () => {
    if (!user?.uid) {
      alert('Please sign in to execute workflows');
      return;
    }

    setIsExecuting(true);
    setExecutionLogs([]);
    setShowExecutionDialog(true);
    setCompletedNodes(new Set());
    setFailedNodes(new Set());
    setExecutingNodes(new Set());

    try {
      const workflow = convertNodesToWorkflow();
      
      // Simulate visual execution - update nodes sequentially
      await simulateWorkflowExecution();
      
      // Create executor instance
      const executor = new WorkflowExecutor(workflow, user.uid);
      
      // Execute workflow
      const result = await executor.execute(workflow);
      
      // Get execution logs
      const logs = executor.getLogs();
      setExecutionLogs(logs);

      if (result.success) {
        alert(`✅ Workflow executed successfully!\n\nExecution ID: ${result.executionId}\nDuration: ${result.duration}ms`);
      } else {
        alert(`⚠️ Workflow completed with errors:\n\n${result.errors.join('\n')}\n\nDuration: ${result.duration}ms`);
      }

      // Save execution result to database
      await fetch('/api/workflow-executions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: workflow.id,
          userId: user.uid,
          executionId: result.executionId,
          status: result.status,
          results: result.results,
          errors: result.errors,
          duration: result.duration,
          timestamp: new Date(),
        }),
      });

      // Call parent callback if provided
      if (onExecute) {
        onExecute(workflow);
      }
    } catch (error: any) {
      console.error('Execution error:', error);
      setExecutionLogs((logs) => [...logs, `❌ Execution failed: ${error.message}`]);
      alert(`Failed to execute workflow: ${error.message}`);
    } finally {
      setIsExecuting(false);
      // Reset all statuses after a delay
      setTimeout(() => {
        setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, executionStatus: undefined } })));
        setCompletedNodes(new Set());
        setFailedNodes(new Set());
        setExecutingNodes(new Set());
      }, 3000);
    }
  };

  // Simulate workflow execution with visual feedback
  const simulateWorkflowExecution = async () => {
    const nodeOrder = [...nodes];
    
    for (const node of nodeOrder) {
      // Set node as executing
      setExecutingNodes(prev => new Set([...prev, node.id]));
      setNodes(nds => nds.map(n => 
        n.id === node.id 
          ? { ...n, data: { ...n.data, executionStatus: 'executing' } }
          : n
      ));
      setExecutionLogs(logs => [...logs, `⚡ Executing: ${node.data.label || node.type}`]);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      // Randomly succeed or fail (90% success rate)
      const success = Math.random() > 0.1;
      
      if (success) {
        setCompletedNodes(prev => new Set([...prev, node.id]));
        setNodes(nds => nds.map(n => 
          n.id === node.id 
            ? { ...n, data: { ...n.data, executionStatus: 'completed' } }
            : n
        ));
        setExecutionLogs(logs => [...logs, `✅ Completed: ${node.data.label || node.type}`]);
      } else {
        setFailedNodes(prev => new Set([...prev, node.id]));
        setNodes(nds => nds.map(n => 
          n.id === node.id 
            ? { ...n, data: { ...n.data, executionStatus: 'failed' } }
            : n
        ));
        setExecutionLogs(logs => [...logs, `❌ Failed: ${node.data.label || node.type}`]);
      }
      
      setExecutingNodes(prev => {
        const next = new Set(prev);
        next.delete(node.id);
        return next;
      });
    }
  };

  // Fetch recommended templates based on user profile
  const fetchRecommendations = async () => {
    if (!user) return;
    
    setLoadingRecommendations(true);
    try {
      const response = await fetch('/api/workflows/recommended', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: user.email || 'user',
          businessType: 'ecommerce', // Could be from user settings
          offerings: 'affiliate marketing products',
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Extract template IDs from recommendations
        const templateIds = data.recommendations
          ?.slice(0, 3)
          .map((rec: any) => rec.templateId)
          .filter((id: string) => workflowTemplates.some(t => t.id === id)) || [];
        setRecommendedTemplates(templateIds);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Load template
  const loadTemplate = (templateId: string) => {
    const template = workflowTemplates.find((t) => t.id === templateId);
    if (template) {
      const workflow: WorkflowDefinition = {
        id: `workflow-${Date.now()}`,
        userId: 'current-user',
        name: template.name,
        productType: template.productType,
        status: 'draft',
        stages: template.stages,
        metadata: {
          automationLevel: template.estimatedAutomation,
          successRate: 0,
          executionCount: 0,
          tags: template.requiredIntegrations,
          category: template.category,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      loadWorkflowToCanvas(workflow);
      setTemplateDialogOpen(false);
    }
  };

  // Save current workflow as template
  const handleSaveAsTemplate = () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    const workflow = convertNodesToWorkflow();
    const customTemplate = {
      id: `custom-${Date.now()}`,
      name: templateName,
      description: templateDescription,
      productType: workflow.productType,
      category: 'Custom',
      icon: '⚡',
      estimatedSetupTime: 10,
      estimatedAutomation: workflow.metadata?.automationLevel || 50,
      requiredIntegrations: workflow.metadata?.tags || [],
      popularity: 0,
      stages: workflow.stages,
      createdBy: user?.email || 'user',
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const savedTemplates = JSON.parse(localStorage.getItem('custom-templates') || '[]');
    savedTemplates.push(customTemplate);
    localStorage.setItem('custom-templates', JSON.stringify(savedTemplates));

    setSaveTemplateDialogOpen(false);
    setTemplateName('');
    setTemplateDescription('');
    alert(`Template "${templateName}" saved successfully!`);
  };

  // Duplicate current workflow
  const handleDuplicateWorkflow = () => {
    const workflow = convertNodesToWorkflow();
    const duplicatedWorkflow: WorkflowDefinition = {
      ...workflow,
      id: `workflow-${Date.now()}`,
      name: `${workflow.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    loadWorkflowToCanvas(duplicatedWorkflow);
    alert('Workflow duplicated successfully!');
  };

  // Share workflow
  const handleShareWorkflow = () => {
    const workflow = convertNodesToWorkflow();
    const workflowData = encodeURIComponent(JSON.stringify({
      name: workflow.name,
      productType: workflow.productType,
      stages: workflow.stages,
    }));
    
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/workflow-builder?import=${workflowData}`;
    setShareUrl(url);
    setShareDialogOpen(true);

    // Copy to clipboard
    navigator.clipboard.writeText(url).then(() => {
      console.log('Share URL copied to clipboard');
    });
  };

  return (

    <Box
      sx={{
        display: { xs: 'block', md: 'flex' },
        width: '100%',
        minWidth: 0,
        height: { xs: 'auto', md: 'min(760px, calc(100dvh - 180px))' },
        minHeight: { md: 620 },
        overflow: 'hidden',
        border: '1px solid rgba(148,163,184,0.18)',
        borderRadius: 3,
        backgroundColor: '#020617',
        boxShadow: '0 24px 60px rgba(2,6,23,0.24)',
      }}
    >
      {/* Left Sidebar - Node Palette */}
      <Box
        component="aside"
        sx={{
          width: { xs: '100%', md: 280 },
          flexShrink: 0,
          maxHeight: { xs: 520, md: 'none' },
          overflowY: 'auto',
          boxSizing: 'border-box',
          borderRight: { md: '1px solid rgba(148,163,184,0.18)' },
          borderBottom: { xs: '1px solid rgba(148,163,184,0.18)', md: 0 },
          backgroundColor: '#1e293b',
          color: 'white',
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#93c5fd', fontWeight: 700 }}>
            Workflow Builder
          </Typography>

          <TextField
            fullWidth
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            placeholder="Workflow Name"
            sx={{ mb: 2, backgroundColor: 'white', borderRadius: 1 }}
            inputProps={{ 'aria-label': 'Workflow Name' }}
          />

          <FormControl fullWidth sx={{ mb: 2, backgroundColor: 'white', borderRadius: 1 }}>
            <InputLabel>Product Type</InputLabel>
            <Select
              value={productType}
              label="Product Type"
              onChange={(e) => setProductType(e.target.value as ProductType)}
            >
              <MenuItem value="physical">📦 Physical</MenuItem>
              <MenuItem value="digital">💻 Digital</MenuItem>
              <MenuItem value="service">👔 Service</MenuItem>
              <MenuItem value="subscription">🔄 Subscription</MenuItem>
              <MenuItem value="hybrid">🔀 Hybrid</MenuItem>
            </Select>
          </FormControl>

          <Button
            fullWidth
            variant="contained"
            startIcon={<CopyIcon />}
            onClick={() => {
              setTemplateDialogOpen(true);
              fetchRecommendations();
            }}
            sx={{ mb: 3 }}
          >
            Load Template
          </Button>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => setSaveTemplateDialogOpen(true)}
              sx={{ color: '#93c5fd', borderColor: '#93c5fd' }}
            >
              Save as Template
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={handleDuplicateWorkflow}
              sx={{ color: '#93c5fd', borderColor: '#93c5fd' }}
            >
              Duplicate
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={handleShareWorkflow}
              sx={{ color: '#93c5fd', borderColor: '#93c5fd' }}
            >
              Share
            </Button>
          </Box>

          {/* Validation Warnings */}
          {validationWarnings.length > 0 && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 2, 
                backgroundColor: 'rgba(237, 137, 54, 0.1)',
                position: 'relative',
                zIndex: 1500
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#fbbf24' }}>
                Workflow Issues ({validationWarnings.length})
              </Typography>
              {validationWarnings.map((warning, index) => (
                <Typography key={index} variant="caption" display="block" sx={{ mt: 0.5, color: '#fcd34d' }}>
                  {warning}
                </Typography>
              ))}
            </Alert>
          )}

          <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

          <Typography variant="subtitle2" gutterBottom sx={{ color: '#93c5fd', fontWeight: 600 }}>
            Add Nodes
          </Typography>

          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => addNode('stage')}
                sx={{ backgroundColor: 'rgba(255,255,255,0.05)', mb: 1, borderRadius: 1 }}
              >
                <ListItemIcon>
                  <StorageIcon sx={{ color: '#22d3ee' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Stage" 
                  primaryTypographyProps={{ sx: { color: '#93c5fd' } }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => addNode('trigger')}
                sx={{ backgroundColor: 'rgba(255,255,255,0.05)', mb: 1, borderRadius: 1 }}
              >
              <ListItemIcon>
                <BoltIcon sx={{ color: '#a78bfa' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Trigger" 
                primaryTypographyProps={{ sx: { color: '#93c5fd' } }}
              />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => addNode('action')}
                sx={{ backgroundColor: 'rgba(255,255,255,0.05)', mb: 1, borderRadius: 1 }}
              >
                <ListItemIcon>
                  <SettingsIcon sx={{ color: '#f472b6' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Action" 
                  primaryTypographyProps={{ sx: { color: '#93c5fd' } }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => addNode('condition')}
                sx={{ backgroundColor: 'rgba(255,255,255,0.05)', mb: 1, borderRadius: 1 }}
              >
                <ListItemIcon>
                  <ApiIcon sx={{ color: '#fbbf24' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Condition" 
                  primaryTypographyProps={{ sx: { color: '#93c5fd' } }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Box>

      {/* Main Canvas */}
      <Box sx={{ 
        flexGrow: 1,
        minWidth: 0,
        height: { xs: 640, md: '100%' },
        '& .react-flow__handle': {
          width: '12px',
          height: '12px',
          transition: 'all 0.2s ease',
          '&:hover': {
            width: '16px',
            height: '16px',
            boxShadow: '0 0 8px rgba(139, 92, 246, 0.6)',
          }
        },
        '& .react-flow__handle-connecting': {
          width: '16px',
          height: '16px',
          boxShadow: '0 0 12px rgba(139, 92, 246, 0.8)',
        }
      }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{
            animated: true,
            style: { stroke: '#8b5cf6', strokeWidth: 3 },
            type: 'smoothstep',
          }}
          connectionLineStyle={{ stroke: '#fbbf24', strokeWidth: 3 }}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={4}
          snapToGrid={true}
          snapGrid={[15, 15]}
        >
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'trigger':
                  return '#667eea';
                case 'action':
                  return '#ec4899';
                case 'condition':
                  return '#f59e0b';
                case 'stage':
                  return '#06b6d4';
                default:
                  return '#64748b';
              }
            }}
          />
          <Panel position="top-right">
            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={isSaving || !user}
                  sx={{ backgroundColor: '#10b981' }}
                  title="Save Workflow (Ctrl+S)"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<PlayIcon />}
                  onClick={handleExecute}
                  disabled={isExecuting || !user}
                  sx={{ backgroundColor: '#3b82f6' }}
                  title="Execute Workflow (Ctrl+E)"
                >
                  {isExecuting ? 'Executing...' : 'Execute'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<WebhookIcon />}
                  onClick={() => setWebhookDialogOpen(true)}
                  size="small"
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Webhooks
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  onClick={() => setScheduleDialogOpen(true)}
                  size="small"
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Schedule
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setConditionalDialogOpen(true)}
                  size="small"
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  Conditions
                </Button>
              </Box>
              <Paper 
                sx={{ 
                  p: 1, 
                  backgroundColor: 'rgba(0,0,0,0.7)', 
                  color: 'white',
                  fontSize: '0.75rem'
                }}
              >
                <Typography variant="caption" display="block">
                  ⌨️ Shortcuts: Delete | Ctrl+S (Save) | Ctrl+E (Execute) | Ctrl+D (Duplicate)
                </Typography>
              </Paper>
            </Box>
          </Panel>
        </ReactFlow>
      </Box>

      {/* Template Selection Dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={() => setTemplateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Choose a Workflow Template</DialogTitle>
        <DialogContent>
          {/* Recommended Templates Section */}
          {recommendedTemplates.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BoltIcon sx={{ color: '#667eea' }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#667eea' }}>
                  Recommended for You
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Based on your profile and business type
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                {recommendedTemplates.map((templateId) => {
                  const template = workflowTemplates.find(t => t.id === templateId);
                  if (!template) return null;
                  
                  return (
                    <Paper
                      key={template.id}
                      sx={{ 
                        p: 2, 
                        cursor: 'pointer', 
                        border: 2,
                        borderColor: '#667eea',
                        '&:hover': { 
                          backgroundColor: '#f3f4f6',
                          borderColor: '#5568d3'
                        } 
                      }}
                      onClick={() => loadTemplate(template.id)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h4">{template.icon}</Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6">{template.name}</Typography>
                            <Chip label="Recommended" size="small" color="primary" />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {template.description}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${template.estimatedAutomation}% Auto`}
                          color="success"
                          size="small"
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {template.requiredIntegrations?.map((integration) => (
                          <Chip key={integration} label={integration} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
              <Divider sx={{ my: 3 }} />
            </Box>
          )}

          {/* All Templates Section */}
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            All Templates
          </Typography>
          <List>
            {workflowTemplates.map((template) => (
              <Paper
                key={template.id}
                sx={{ p: 2, mb: 2, cursor: 'pointer', '&:hover': { backgroundColor: '#f3f4f6' } }}
                onClick={() => loadTemplate(template.id)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="h4">{template.icon}</Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{template.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                  </Box>
                  <Chip
                    label={`${template.estimatedAutomation}% Auto`}
                    color="success"
                    size="small"
                  />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {template.requiredIntegrations?.map((integration) => (
                    <Chip key={integration} label={integration} size="small" variant="outlined" />
                  ))}
                </Box>
              </Paper>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Node Configuration Panel */}
      <NodeConfigPanel
        node={selectedNode}
        open={configPanelOpen}
        onClose={() => setConfigPanelOpen(false)}
        onSave={handleNodeSave}
        onDelete={handleNodeDelete}
      />

      {/* Execution Log Dialog */}
      <Dialog
        open={showExecutionDialog}
        onClose={() => setShowExecutionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlayIcon />
            Workflow Execution Log
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              p: 2,
              borderRadius: 1,
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.875rem',
              maxHeight: '500px',
              overflow: 'auto',
            }}
          >
            {executionLogs.length === 0 ? (
              <Typography color="text.secondary">
                {isExecuting ? 'Executing workflow...' : 'No logs available'}
              </Typography>
            ) : (
              executionLogs.map((log, index) => (
                <Box key={index} sx={{ mb: 0.5, whiteSpace: 'pre-wrap' }}>
                  {log}
                </Box>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExecutionDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Save as Template Dialog */}
      <Dialog
        open={saveTemplateDialogOpen}
        onClose={() => setSaveTemplateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Save as Custom Template</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            placeholder="e.g., My Instagram Automation Flow"
          />
          <TextField
            fullWidth
            label="Description"
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
            multiline
            rows={3}
            placeholder="Describe what this template does..."
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            This template will be saved locally and available in your template library.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveTemplateDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveAsTemplate} variant="contained">
            Save Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Workflow Dialog */}
      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Share Workflow</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share this workflow with your team or community. Anyone with this link can import it.
          </Typography>
          <TextField
            fullWidth
            value={shareUrl}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <Button
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert('Link copied to clipboard!');
                  }}
                >
                  Copy
                </Button>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                window.open(`https://twitter.com/intent/tweet?text=Check%20out%20my%20workflow&url=${encodeURIComponent(shareUrl)}`, '_blank');
              }}
            >
              Share on Twitter
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                window.open(`mailto:?subject=Workflow%20Share&body=${encodeURIComponent(shareUrl)}`, '_blank');
              }}
            >
              Share via Email
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Webhook Management Dialog */}
      <Dialog open={webhookDialogOpen} onClose={() => setWebhookDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WebhookIcon />
            Webhook Management
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Configure webhooks to trigger your workflow from external services
            </Typography>

            {/* Existing Webhooks */}
            {webhooks.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Active Webhooks
                </Typography>
                {webhooks.map((webhook) => (
                  <Card key={webhook.id} sx={{ mb: 1, p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {webhook.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                          {webhook.url}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {webhook.events.map((event: string, idx: number) => (
                            <Chip key={idx} label={event} size="small" />
                          ))}
                        </Box>
                      </Box>
                      <IconButton size="small" onClick={() => handleDeleteWebhook(webhook.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Add New Webhook */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Add New Webhook
            </Typography>
            <TextField
              label="Webhook Name"
              value={newWebhook.name}
              onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Webhook URL"
              value={newWebhook.url}
              onChange={(e) => setNewWebhook(prev => ({ ...prev, url: e.target.value }))}
              fullWidth
              placeholder="https://example.com/webhook"
              sx={{ mb: 2 }}
            />
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Select events that will trigger this webhook:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              {['workflow.started', 'workflow.completed', 'workflow.failed', 'node.completed'].map((event) => (
                <Chip
                  key={event}
                  label={event}
                  onClick={() => {
                    setNewWebhook(prev => ({
                      ...prev,
                      events: prev.events.includes(event)
                        ? prev.events.filter(e => e !== event)
                        : [...prev.events, event]
                    }));
                  }}
                  color={newWebhook.events.includes(event) ? 'primary' : 'default'}
                  variant={newWebhook.events.includes(event) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWebhookDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleAddWebhook}>
            Add Webhook
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Management Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ScheduleIcon />
            Scheduled Execution
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Schedule automatic workflow execution at specific times
            </Typography>

            {/* Existing Schedules */}
            {schedules.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Active Schedules
                </Typography>
                {schedules.map((schedule) => (
                  <Card key={schedule.id} sx={{ mb: 1, p: 2, opacity: schedule.enabled ? 1 : 0.6 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {schedule.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Frequency: {schedule.frequency} at {schedule.time}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Next run: {schedule.nextRun}
                        </Typography>
                        <Chip
                          label={schedule.enabled ? 'Active' : 'Paused'}
                          size="small"
                          color={schedule.enabled ? 'success' : 'default'}
                          sx={{ mt: 1 }}
                        />
                      </Box>
                      <Box>
                        <IconButton size="small" onClick={() => handleToggleSchedule(schedule.id)}>
                          {schedule.enabled ? <TimerIcon /> : <TimerIcon />}
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteSchedule(schedule.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Add New Schedule */}
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Create New Schedule
            </Typography>
            <TextField
              label="Schedule Name"
              value={newSchedule.name}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={newSchedule.frequency}
                label="Frequency"
                onChange={(e) => setNewSchedule(prev => ({ ...prev, frequency: e.target.value }))}
              >
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Time"
              type="time"
              value={newSchedule.time}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleAddSchedule}>
            Create Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Conditional Logic Dialog */}
      <Dialog open={conditionalDialogOpen} onClose={() => setConditionalDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterList />
            Conditional Logic
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Add conditional rules to control workflow execution
            </Typography>

            {conditionalRules.length > 0 && (
              <Box sx={{ mb: 3 }}>
                {conditionalRules.map((rule) => (
                  <Card key={rule.id} sx={{ mb: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
                      <FormControl size="small" sx={{ minWidth: 80 }}>
                        <Select
                          value={rule.condition}
                          onChange={(e) => handleUpdateConditionalRule(rule.id, { condition: e.target.value })}
                        >
                          <MenuItem value="if">If</MenuItem>
                          <MenuItem value="else if">Else If</MenuItem>
                          <MenuItem value="else">Else</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        placeholder="Field"
                        value={rule.field}
                        onChange={(e) => handleUpdateConditionalRule(rule.id, { field: e.target.value })}
                        sx={{ flex: 1 }}
                      />
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={rule.operator}
                          onChange={(e) => handleUpdateConditionalRule(rule.id, { operator: e.target.value })}
                        >
                          <MenuItem value="equals">Equals</MenuItem>
                          <MenuItem value="not_equals">Not Equals</MenuItem>
                          <MenuItem value="greater_than">Greater Than</MenuItem>
                          <MenuItem value="less_than">Less Than</MenuItem>
                          <MenuItem value="contains">Contains</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        placeholder="Value"
                        value={rule.value}
                        onChange={(e) => handleUpdateConditionalRule(rule.id, { value: e.target.value })}
                        sx={{ flex: 1 }}
                      />
                      <IconButton size="small" onClick={() => handleDeleteConditionalRule(rule.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Action</InputLabel>
                      <Select
                        value={rule.action}
                        label="Action"
                        onChange={(e) => handleUpdateConditionalRule(rule.id, { action: e.target.value })}
                      >
                        <MenuItem value="continue">Continue</MenuItem>
                        <MenuItem value="skip">Skip Next Step</MenuItem>
                        <MenuItem value="stop">Stop Workflow</MenuItem>
                        <MenuItem value="branch">Branch to Alternative Path</MenuItem>
                      </Select>
                    </FormControl>
                  </Card>
                ))}
              </Box>
            )}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddConditionalRule}
              fullWidth
            >
              Add Condition
            </Button>

            {conditionalRules.length > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {conditionalRules.length} conditional rule(s) configured
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConditionalDialogOpen(false)}>Close</Button>
          <Button variant="contained">
            Apply Rules
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

