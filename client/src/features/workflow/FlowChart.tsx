'use client';

import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  Add,
  Event,
  CalendarMonth,
  Lightbulb,
  Schedule,
  VideoCall,
  Campaign,
  Edit,
  Delete,
  Check,
  ViewWeek,
  ViewDay,
  ViewAgenda,
} from '@mui/icons-material';

interface ScheduledItem {
  id: string;
  type: 'meeting' | 'post' | 'idea';
  title: string;
  description: string;
  date: Date;
  time: string;
  platform?: string;
  status: 'scheduled' | 'completed' | 'draft';
  aiGenerated?: boolean;
}

interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: 'marketing' | 'sales' | 'content' | 'automation';
  icon: string;
  steps: string[];
  estimatedTime: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export default function FlowChart() {
  const [view, setView] = useState<'week' | 'month' | 'agenda'>('week');
  const [currentTab, setCurrentTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);
  const [newItemType, setNewItemType] = useState<'meeting' | 'post' | 'idea'>('post');
  const [activeCard, setActiveCard] = useState<'schedule' | 'create' | 'ideas'>('schedule');

  // Pre-built workflow templates
  const workflowTemplates: WorkflowTemplate[] = [
    {
      id: '1',
      title: 'Product Launch Campaign',
      description: 'Complete workflow for launching a new affiliate product with maximum impact',
      category: 'marketing',
      icon: '🚀',
      steps: [
        'Research product and target audience',
        'Create product review content',
        'Design social media graphics',
        'Schedule Instagram, TikTok, and Twitter posts',
        'Set up email campaign',
        'Monitor performance and optimize',
      ],
      estimatedTime: '2 weeks',
      difficulty: 'intermediate',
    },
    {
      id: '2',
      title: 'Weekly Content Calendar',
      description: 'Automate your weekly content creation and posting schedule',
      category: 'content',
      icon: '📅',
      steps: [
        'AI trend analysis on Monday',
        'Content brainstorming session',
        'Create 3 blog posts',
        'Design graphics for each post',
        'Schedule social media posts (Mon-Fri)',
        'Engage with audience daily',
      ],
      estimatedTime: '1 week',
      difficulty: 'beginner',
    },
    {
      id: '3',
      title: 'Influencer Outreach Campaign',
      description: 'Systematic approach to partner with influencers for affiliate promotion',
      category: 'sales',
      icon: '🤝',
      steps: [
        'Identify relevant influencers in niche',
        'Analyze engagement rates and audience fit',
        'Craft personalized outreach emails',
        'Schedule follow-up meetings',
        'Negotiate partnership terms',
        'Track campaign performance',
      ],
      estimatedTime: '3 weeks',
      difficulty: 'advanced',
    },
    {
      id: '4',
      title: 'Email Nurture Sequence',
      description: 'Automated email workflow to convert subscribers into customers',
      category: 'automation',
      icon: '📧',
      steps: [
        'Welcome email (Day 0)',
        'Value content email (Day 2)',
        'Product showcase email (Day 5)',
        'Social proof email (Day 7)',
        'Limited offer email (Day 10)',
        'Follow-up and feedback request',
      ],
      estimatedTime: '10 days',
      difficulty: 'intermediate',
    },
    {
      id: '5',
      title: 'Seasonal Campaign Strategy',
      description: 'Plan and execute high-converting seasonal promotions',
      category: 'marketing',
      icon: '🎄',
      steps: [
        'Research seasonal trends 6 weeks ahead',
        'Select top-performing products',
        'Create themed content and graphics',
        'Schedule countdown posts',
        'Launch promotion with email blast',
        'Daily optimization and reporting',
      ],
      estimatedTime: '6 weeks',
      difficulty: 'intermediate',
    },
    {
      id: '6',
      title: 'A/B Testing Workflow',
      description: 'Systematically test and optimize your marketing campaigns',
      category: 'automation',
      icon: '🧪',
      steps: [
        'Define testing hypothesis',
        'Create variant A and B',
        'Set up tracking and metrics',
        'Run test for sufficient sample size',
        'Analyze results statistically',
        'Implement winning variant',
      ],
      estimatedTime: '2 weeks',
      difficulty: 'advanced',
    },
  ];
  
  const [scheduledItems, setScheduledItems] = useState<ScheduledItem[]>([
    {
      id: '1',
      type: 'post',
      title: 'Instagram Story - New Product Launch',
      description: 'Promote wireless earbuds with discount code',
      date: new Date(2025, 9, 15, 10, 0),
      time: '10:00 AM',
      platform: 'Instagram',
      status: 'scheduled',
      aiGenerated: true,
    },
    {
      id: '2',
      type: 'meeting',
      title: 'Strategy Review Meeting',
      description: 'Q4 campaign planning with team',
      date: new Date(2025, 9, 16, 14, 0),
      time: '2:00 PM',
      status: 'scheduled',
    },
    {
      id: '3',
      type: 'idea',
      title: 'TikTok Trend: Sustainable Fashion',
      description: 'AI suggests creating content around eco-friendly products',
      date: new Date(2025, 9, 17, 9, 0),
      time: '9:00 AM',
      status: 'draft',
      aiGenerated: true,
    },
  ]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    platform: 'Instagram',
  });

  const handleCreateItem = () => {
    const newItem: ScheduledItem = {
      id: Date.now().toString(),
      type: newItemType,
      title: formData.title,
      description: formData.description,
      date: new Date(formData.date + 'T' + formData.time),
      time: formData.time,
      platform: newItemType === 'post' ? formData.platform : undefined,
      status: 'scheduled',
    };
    
    setScheduledItems([...scheduledItems, newItem]);
    setDialogOpen(false);
    setFormData({ title: '', description: '', date: '', time: '', platform: 'Instagram' });
  };

  const handleDeleteItem = (id: string) => {
    setScheduledItems(scheduledItems.filter(item => item.id !== id));
  };

  const handleCompleteItem = (id: string) => {
    setScheduledItems(scheduledItems.map(item => 
      item.id === id ? { ...item, status: 'completed' as const } : item
    ));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <VideoCall />;
      case 'post': return <Campaign />;
      case 'idea': return <Lightbulb />;
      default: return <Event />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'primary';
      case 'post': return 'success';
      case 'idea': return 'warning';
      default: return 'default';
    }
  };

  const upcomingItems = scheduledItems
    .filter(item => item.status !== 'completed')
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const aiSuggestions = scheduledItems.filter(item => item.aiGenerated && item.status === 'draft');

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            FlowChart
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Schedule meetings, plan content posts, and get AI-powered content ideas
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(e, newView) => newView && setView(newView)}
            size="small"
          >
            <ToggleButton value="day">
              <ViewDay />
            </ToggleButton>
            <ToggleButton value="week">
              <ViewWeek />
            </ToggleButton>
            <ToggleButton value="month">
              <CalendarMonth />
            </ToggleButton>
          </ToggleButtonGroup>
          
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{ minHeight: 48 }}
          >
            Schedule Item
          </Button>
        </Box>
      </Box>

      {/* Workflow Templates Section */}
      <Card sx={{ mb: 3, bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: 'white' }}>
                🎯 Recommended Workflows
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Pre-built marketing and business workflows to accelerate your success
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {workflowTemplates.map((workflow) => (
              <Card
                key={workflow.id}
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => {
                  setSelectedWorkflow(workflow);
                  setWorkflowDialogOpen(true);
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Typography variant="h4">{workflow.icon}</Typography>
                    <Chip
                      label={workflow.category}
                      size="small"
                      color={
                        workflow.category === 'marketing' ? 'primary' :
                        workflow.category === 'sales' ? 'success' :
                        workflow.category === 'content' ? 'warning' : 'secondary'
                      }
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {workflow.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {workflow.description}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={workflow.estimatedTime} size="small" variant="outlined" />
                    <Chip
                      label={workflow.difficulty}
                      size="small"
                      variant="outlined"
                      color={
                        workflow.difficulty === 'beginner' ? 'success' :
                        workflow.difficulty === 'intermediate' ? 'warning' : 'error'
                      }
                    />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Main Calendar/List View */}
        <Box>
          <Card>
            <CardContent>
              <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ mb: 3 }}>
                <Tab label="Upcoming" icon={<Schedule />} iconPosition="start" />
                <Tab label="All Scheduled" icon={<Event />} iconPosition="start" />
                <Tab label="Completed" icon={<Check />} iconPosition="start" />
              </Tabs>

              {currentTab === 0 && (
                <List>
                  {upcomingItems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <CalendarMonth sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary">
                        No upcoming items scheduled
                      </Typography>
                    </Box>
                  ) : (
                    upcomingItems.map((item) => (
                      <Box key={item.id}>
                        <ListItem
                          sx={{
                            bgcolor: 'grey.50',
                            borderRadius: 2,
                            mb: 2,
                            p: 3,
                          }}
                        >
                          <Avatar sx={{ bgcolor: `${getTypeColor(item.type)}.main`, mr: 2 }}>
                            {getTypeIcon(item.type)}
                          </Avatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" fontWeight={600}>
                                  {item.title}
                                </Typography>
                                {item.aiGenerated && (
                                  <Chip label="AI" size="small" color="secondary" />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {item.description}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                  <Chip
                                    icon={<Event />}
                                    label={item.date.toLocaleDateString()}
                                    size="small"
                                    variant="outlined"
                                  />
                                  <Chip
                                    icon={<Schedule />}
                                    label={item.time}
                                    size="small"
                                    variant="outlined"
                                  />
                                  {item.platform && (
                                    <Chip
                                      label={item.platform}
                                      size="small"
                                      color={getTypeColor(item.type)}
                                    />
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              edge="end"
                              onClick={() => handleCompleteItem(item.id)}
                              sx={{ mr: 1 }}
                            >
                              <Check />
                            </IconButton>
                            <IconButton edge="end" onClick={() => handleDeleteItem(item.id)}>
                              <Delete />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </Box>
                    ))
                  )}
                </List>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* AI Suggestions Sidebar */}
        <Box>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <Lightbulb color="warning" />
                <Typography variant="h6" fontWeight={600}>
                  AI Content Ideas
                </Typography>
              </Box>

              {aiSuggestions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    AI is analyzing trends...
                  </Typography>
                </Box>
              ) : (
                <List>
                  {aiSuggestions.map((item) => (
                    <Box key={item.id}>
                      <ListItem sx={{ px: 0, py: 2 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight={600} gutterBottom>
                              {item.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {item.description}
                            </Typography>
                          }
                        />
                      </ListItem>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Button size="small" variant="outlined" fullWidth>
                          Schedule
                        </Button>
                        <Button size="small" variant="text" fullWidth>
                          Dismiss
                        </Button>
                      </Box>
                      <Divider />
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                This Week
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Meetings</Typography>
                  <Typography fontWeight={600}>3</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Posts Scheduled</Typography>
                  <Typography fontWeight={600}>8</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">AI Ideas</Typography>
                  <Typography fontWeight={600}>12</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Workflow Detail Dialog */}
      <Dialog
        open={workflowDialogOpen}
        onClose={() => setWorkflowDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedWorkflow && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4">{selectedWorkflow.icon}</Typography>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {selectedWorkflow.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip
                      label={selectedWorkflow.category}
                      size="small"
                      color={
                        selectedWorkflow.category === 'marketing' ? 'primary' :
                        selectedWorkflow.category === 'sales' ? 'success' :
                        selectedWorkflow.category === 'content' ? 'warning' : 'secondary'
                      }
                    />
                    <Chip label={selectedWorkflow.estimatedTime} size="small" variant="outlined" />
                    <Chip
                      label={selectedWorkflow.difficulty}
                      size="small"
                      color={
                        selectedWorkflow.difficulty === 'beginner' ? 'success' :
                        selectedWorkflow.difficulty === 'intermediate' ? 'warning' : 'error'
                      }
                    />
                  </Box>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" color="text.secondary" paragraph>
                {selectedWorkflow.description}
              </Typography>
              
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mt: 3 }}>
                Workflow Steps:
              </Typography>
              <List>
                {selectedWorkflow.steps.map((step, index) => (
                  <ListItem key={index} sx={{ py: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        mr: 2,
                        bgcolor: 'primary.main',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <ListItemText
                      primary={step}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>

              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: 'info.lighter',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'info.light',
                }}
              >
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lightbulb color="info" />
                  <strong>Pro Tip:</strong> You can customize this workflow to match your specific needs. FlowBot can help you adapt these steps to your niche!
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setWorkflowDialogOpen(false)}>
                Close
              </Button>
              <Button
                variant="outlined"
                startIcon={<Campaign />}
                onClick={() => {
                  // TODO: Implement workflow scheduling
                  setWorkflowDialogOpen(false);
                  alert('This workflow will be added to your schedule!');
                }}
              >
                Add to Calendar
              </Button>
              <Button
                variant="contained"
                startIcon={<Lightbulb />}
                onClick={() => {
                  // TODO: Open FlowBot with workflow context
                  setWorkflowDialogOpen(false);
                  alert('Ask FlowBot: "Help me customize the ' + selectedWorkflow.title + ' workflow"');
                }}
              >
                Ask FlowBot
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Item Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule New Item</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newItemType}
                onChange={(e) => setNewItemType(e.target.value as any)}
                label="Type"
              >
                <MenuItem value="meeting">Meeting</MenuItem>
                <MenuItem value="post">Content Post</MenuItem>
                <MenuItem value="idea">Content Idea</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />

            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />

            <TextField
              fullWidth
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            />

            <TextField
              fullWidth
              type="time"
              label="Time"
              InputLabelProps={{ shrink: true }}
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />

            {newItemType === 'post' && (
              <FormControl fullWidth>
                <InputLabel>Platform</InputLabel>
                <Select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  label="Platform"
                >
                  <MenuItem value="Instagram">Instagram</MenuItem>
                  <MenuItem value="TikTok">TikTok</MenuItem>
                  <MenuItem value="Twitter">Twitter</MenuItem>
                  <MenuItem value="Facebook">Facebook</MenuItem>
                  <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateItem}>
            Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
