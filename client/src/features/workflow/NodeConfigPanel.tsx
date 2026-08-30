'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Node } from '@xyflow/react';

interface NodeConfigPanelProps {
  node: Node | null;
  open: boolean;
  onClose: () => void;
  onSave: (nodeId: string, data: any) => void;
  onDelete: (nodeId: string) => void;
}

export default function NodeConfigPanel({
  node,
  open,
  onClose,
  onSave,
  onDelete,
}: NodeConfigPanelProps) {
  const [nodeData, setNodeData] = useState<any>({});

  useEffect(() => {
    if (node) {
      setNodeData(node.data || {});
    }
  }, [node]);

  if (!node) return null;

  const handleSave = () => {
    onSave(node.id, nodeData);
    onClose();
  };

  const handleDelete = () => {
    onDelete(node.id);
    onClose();
  };

  const updateData = (key: string, value: any) => {
    setNodeData({ ...nodeData, [key]: value });
  };

  const renderTriggerConfig = () => (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Trigger Type</InputLabel>
        <Select
          value={nodeData.triggerType || 'schedule'}
          label="Trigger Type"
          onChange={(e) => updateData('triggerType', e.target.value)}
        >
          <MenuItem value="schedule">⏰ Schedule</MenuItem>
          <MenuItem value="webhook">🔗 Webhook</MenuItem>
          <MenuItem value="event">⚡ Event</MenuItem>
          <MenuItem value="manual">👆 Manual</MenuItem>
        </Select>
      </FormControl>

      {nodeData.triggerType === 'schedule' && (
        <>
          <TextField
            fullWidth
            label="Cron Expression"
            value={nodeData.cronExpression || '0 9 * * *'}
            onChange={(e) => updateData('cronExpression', e.target.value)}
            helperText="e.g., 0 9 * * * (daily at 9 AM)"
            sx={{ mb: 2 }}
          />
          <Alert severity="info" sx={{ mb: 2 }}>
            Common patterns:
            <br />• Every hour: 0 * * * *
            <br />• Daily at 9 AM: 0 9 * * *
            <br />• Every Monday: 0 9 * * 1
          </Alert>
        </>
      )}

      {nodeData.triggerType === 'webhook' && (
        <TextField
          fullWidth
          label="Webhook URL"
          value={nodeData.webhookUrl || ''}
          onChange={(e) => updateData('webhookUrl', e.target.value)}
          placeholder="https://your-domain.com/webhook"
          sx={{ mb: 2 }}
        />
      )}

      {nodeData.triggerType === 'event' && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Event Type</InputLabel>
          <Select
            value={nodeData.eventType || 'campaign.created'}
            label="Event Type"
            onChange={(e) => updateData('eventType', e.target.value)}
          >
            <MenuItem value="campaign.created">Campaign Created</MenuItem>
            <MenuItem value="campaign.updated">Campaign Updated</MenuItem>
            <MenuItem value="product.found">Product Found</MenuItem>
            <MenuItem value="content.generated">Content Generated</MenuItem>
          </Select>
        </FormControl>
      )}
    </Box>
  );

  const renderActionConfig = () => (
    <Box>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Action Type</InputLabel>
        <Select
          value={nodeData.actionType || 'generate-content'}
          label="Action Type"
          onChange={(e) => updateData('actionType', e.target.value)}
        >
          <MenuItem value="generate-content">✍️ Generate Content</MenuItem>
          <MenuItem value="find-products">🔍 Find Products</MenuItem>
          <MenuItem value="send-email">📧 Send Email</MenuItem>
          <MenuItem value="post-instagram">📸 Post to Instagram</MenuItem>
          <MenuItem value="analyze-image">🖼️ Analyze Image</MenuItem>
          <MenuItem value="delay">⏱️ Delay</MenuItem>
          <MenuItem value="http-request">🌐 HTTP Request</MenuItem>
        </Select>
      </FormControl>

      {nodeData.actionType === 'generate-content' && (
        <>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Content Type</InputLabel>
            <Select
              value={nodeData.contentType || 'caption'}
              label="Content Type"
              onChange={(e) => updateData('contentType', e.target.value)}
            >
              <MenuItem value="caption">Caption</MenuItem>
              <MenuItem value="blog-post">Blog Post</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="script">Video Script</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Prompt Template"
            value={nodeData.promptTemplate || ''}
            onChange={(e) => updateData('promptTemplate', e.target.value)}
            multiline
            rows={4}
            placeholder="Write a caption for {{product.name}}..."
            helperText="Use {{variable}} for dynamic content"
            sx={{ mb: 2 }}
          />
        </>
      )}

      {nodeData.actionType === 'find-products' && (
        <>
          <TextField
            fullWidth
            label="Search Query"
            value={nodeData.searchQuery || ''}
            onChange={(e) => updateData('searchQuery', e.target.value)}
            placeholder="wireless headphones under $100"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="number"
            label="Max Results"
            value={nodeData.maxResults || 10}
            onChange={(e) => updateData('maxResults', parseInt(e.target.value))}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Source</InputLabel>
            <Select
              value={nodeData.source || 'nordstrom'}
              label="Source"
              onChange={(e) => updateData('source', e.target.value)}
            >
              <MenuItem value="nordstrom">Nordstrom</MenuItem>
              <MenuItem value="amazon">Amazon</MenuItem>
              <MenuItem value="shopify">Shopify</MenuItem>
            </Select>
          </FormControl>
        </>
      )}

      {nodeData.actionType === 'send-email' && (
        <>
          <TextField
            fullWidth
            label="To Email"
            value={nodeData.toEmail || ''}
            onChange={(e) => updateData('toEmail', e.target.value)}
            placeholder="user@example.com or {{user.email}}"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Subject"
            value={nodeData.subject || ''}
            onChange={(e) => updateData('subject', e.target.value)}
            placeholder="Email subject"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Body Template"
            value={nodeData.bodyTemplate || ''}
            onChange={(e) => updateData('bodyTemplate', e.target.value)}
            multiline
            rows={4}
            placeholder="Email body with {{variables}}"
            sx={{ mb: 2 }}
          />
        </>
      )}

      {nodeData.actionType === 'post-instagram' && (
        <>
          <TextField
            fullWidth
            label="Caption"
            value={nodeData.caption || ''}
            onChange={(e) => updateData('caption', e.target.value)}
            multiline
            rows={3}
            placeholder="Instagram caption with hashtags"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Image URL or Variable"
            value={nodeData.imageUrl || ''}
            onChange={(e) => updateData('imageUrl', e.target.value)}
            placeholder="{{generated.imageUrl}}"
            helperText="Use image from previous step"
            sx={{ mb: 2 }}
          />
        </>
      )}

      {nodeData.actionType === 'delay' && (
        <>
          <TextField
            fullWidth
            type="number"
            label="Delay (minutes)"
            value={nodeData.delayMinutes || 5}
            onChange={(e) => updateData('delayMinutes', parseInt(e.target.value))}
            sx={{ mb: 2 }}
          />
        </>
      )}

      {nodeData.actionType === 'http-request' && (
        <>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Method</InputLabel>
            <Select
              value={nodeData.method || 'GET'}
              label="Method"
              onChange={(e) => updateData('method', e.target.value)}
            >
              <MenuItem value="GET">GET</MenuItem>
              <MenuItem value="POST">POST</MenuItem>
              <MenuItem value="PUT">PUT</MenuItem>
              <MenuItem value="DELETE">DELETE</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="URL"
            value={nodeData.url || ''}
            onChange={(e) => updateData('url', e.target.value)}
            placeholder="https://api.example.com/endpoint"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Request Body (JSON)"
            value={nodeData.requestBody || ''}
            onChange={(e) => updateData('requestBody', e.target.value)}
            multiline
            rows={4}
            placeholder='{"key": "value"}'
            sx={{ mb: 2 }}
          />
        </>
      )}
    </Box>
  );

  const renderConditionConfig = () => (
    <Box>
      <TextField
        fullWidth
        label="Field/Variable"
        value={nodeData.field || ''}
        onChange={(e) => updateData('field', e.target.value)}
        placeholder="e.g., product.price or {{previous.result.count}}"
        sx={{ mb: 2 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Operator</InputLabel>
        <Select
          value={nodeData.operator || 'equals'}
          label="Operator"
          onChange={(e) => updateData('operator', e.target.value)}
        >
          <MenuItem value="equals">Equals (==)</MenuItem>
          <MenuItem value="not-equals">Not Equals (!=)</MenuItem>
          <MenuItem value="greater-than">Greater Than (&gt;)</MenuItem>
          <MenuItem value="less-than">Less Than (&lt;)</MenuItem>
          <MenuItem value="contains">Contains</MenuItem>
          <MenuItem value="not-contains">Does Not Contain</MenuItem>
          <MenuItem value="exists">Exists</MenuItem>
          <MenuItem value="not-exists">Does Not Exist</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Value"
        value={nodeData.value || ''}
        onChange={(e) => updateData('value', e.target.value)}
        placeholder="Comparison value"
        sx={{ mb: 2 }}
      />

      <Alert severity="info">
        Conditions control workflow branching. Connect the &quot;true&quot; output to one path and &quot;false&quot; to another.
      </Alert>
    </Box>
  );

  const renderStageConfig = () => (
    <Box>
      <TextField
        fullWidth
        label="Stage Name"
        value={nodeData.label || ''}
        onChange={(e) => updateData('label', e.target.value)}
        placeholder="e.g., Product Research"
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Description"
        value={nodeData.description || ''}
        onChange={(e) => updateData('description', e.target.value)}
        multiline
        rows={3}
        placeholder="Describe what happens in this stage"
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        type="number"
        label="Stage Order"
        value={nodeData.order || 1}
        onChange={(e) => updateData('order', parseInt(e.target.value))}
        sx={{ mb: 2 }}
      />
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          p: 3,
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">
          Configure {node.type ? node.type.charAt(0).toUpperCase() + node.type.slice(1) : 'Node'}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <TextField
        fullWidth
        label="Node Label"
        value={nodeData.label || ''}
        onChange={(e) => updateData('label', e.target.value)}
        sx={{ mb: 3 }}
      />

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight="bold">Settings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {node.type === 'trigger' && renderTriggerConfig()}
          {node.type === 'action' && renderActionConfig()}
          {node.type === 'condition' && renderConditionConfig()}
          {node.type === 'stage' && renderStageConfig()}
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 'auto', pt: 3, display: 'flex', gap: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={handleDelete}
        >
          Delete
        </Button>
        <Button
          fullWidth
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
        >
          Save
        </Button>
      </Box>
    </Drawer>
  );
}
