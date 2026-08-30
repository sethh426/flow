'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  TextField,
  MenuItem,
  LinearProgress,
  Alert,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Grid2 from '@/components/Grid2';
import {
  Schedule,
  CalendarMonth,
  AccessTime,
  NotificationsActive,
  AutoMode,
  TrendingUp,
  CheckCircle,
  Event,
  PersonAdd,
  Settings,
  Edit,
  Delete,
} from '@mui/icons-material';

interface Appointment {
  id: string;
  title: string;
  client: string;
  date: Date;
  duration: number;
  type: 'consultation' | 'demo' | 'meeting' | 'call';
  status: 'confirmed' | 'pending' | 'completed';
  reminders: boolean;
}

const FlowTime = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      title: 'Product Demo',
      client: 'Sarah Johnson',
      date: new Date(2025, 9, 15, 14, 0),
      duration: 60,
      type: 'demo',
      status: 'confirmed',
      reminders: true,
    },
    {
      id: '2',
      title: 'Strategy Call',
      client: 'Mike Chen',
      date: new Date(2025, 9, 15, 16, 30),
      duration: 45,
      type: 'call',
      status: 'pending',
      reminders: true,
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);

  const stats = [
    {
      label: 'Today\'s Appointments',
      value: '4',
      change: '+2 from yesterday',
      icon: CalendarMonth,
      color: '#2196f3',
    },
    {
      label: 'No-Show Rate',
      value: '5%',
      change: '-80% with AI reminders',
      icon: TrendingUp,
      color: '#4caf50',
    },
    {
      label: 'Booking Rate',
      value: '78%',
      change: '+35% self-service',
      icon: CheckCircle,
      color: '#ff9800',
    },
    {
      label: 'Avg Response Time',
      value: '< 5min',
      change: 'Real-time availability',
      icon: AccessTime,
      color: '#9c27b0',
    },
  ];

  const features = [
    {
      title: 'AI-Powered Scheduling',
      description: 'Reduce no-shows by 80% with intelligent reminders',
      icon: AutoMode,
      benefits: [
        '48-hour advance reminders',
        '24-hour confirmations',
        'Day-of notifications',
        'Real-time calendar sync',
      ],
    },
    {
      title: 'Automated Confirmations',
      description: 'Multi-channel reminders via email, SMS, and push',
      icon: NotificationsActive,
      benefits: [
        'Email confirmations',
        'SMS reminders (2-way)',
        'Push notifications',
        'Custom message templates',
      ],
    },
    {
      title: 'Self-Service Booking',
      description: 'Let clients book instantly with real-time availability',
      icon: Event,
      benefits: [
        'Public booking pages',
        'Calendar integration',
        'Buffer time rules',
        'Timezone detection',
      ],
    },
    {
      title: 'Smart Optimization',
      description: 'Maximize revenue with intelligent slot allocation',
      icon: TrendingUp,
      benefits: [
        'High-value client priority',
        'Back-to-back reduction',
        'Travel time buffers',
        'Peak hour optimization',
      ],
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'demo':
        return '🎯';
      case 'call':
        return '📞';
      case 'meeting':
        return '🤝';
      case 'consultation':
        return '💡';
      default:
        return '📅';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Schedule sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
          <Box>
            <Typography variant="h3" fontWeight="bold">
              FlowTime
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Intelligent Scheduling & Appointment Automation
            </Typography>
          </Box>
        </Box>
        <Alert severity="info" icon={<AutoMode />} sx={{ mb: 3 }}>
          <strong>AI-Powered Scheduling:</strong> Reduce no-shows by 80% and increase booking rates by 35% with automated reminders and self-service booking.
        </Alert>
      </Box>

      {/* Stats */}
      <Grid2 container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid2 size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: `${stat.color}15`,
                      mr: 2,
                    }}
                  >
                    <stat.icon sx={{ color: stat.color, fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="success.main">
                  {stat.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      {/* Today's Schedule */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Today's Schedule
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => setOpenDialog(true)}
          >
            New Appointment
          </Button>
        </Box>

        <Stack spacing={2}>
          {appointments.map((apt) => (
            <Card key={apt.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <Typography sx={{ fontSize: 32, mr: 2 }}>
                      {getTypeIcon(apt.type)}
                    </Typography>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {apt.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {apt.client}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip
                          size="small"
                          label={apt.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          icon={<AccessTime />}
                        />
                        <Chip
                          size="small"
                          label={`${apt.duration} min`}
                        />
                        <Chip
                          size="small"
                          label={apt.status}
                          color={getStatusColor(apt.status)}
                        />
                        {apt.reminders && (
                          <Chip
                            size="small"
                            label="Auto Reminders"
                            icon={<NotificationsActive />}
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton size="small">
                      <Edit />
                    </IconButton>
                    <IconButton size="small">
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Paper>

      {/* Features */}
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Key Features
      </Typography>
      <Grid2 container spacing={3}>
        {features.map((feature, index) => (
          <Grid2 size={{ xs: 12, md: 6 }} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'primary.light',
                      mr: 2,
                    }}
                  >
                    <feature.icon sx={{ color: 'primary.main', fontSize: 32 }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
                <Stack spacing={1}>
                  {feature.benefits.map((benefit, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                      <CheckCircle sx={{ fontSize: 18, mr: 1, color: 'success.main' }} />
                      <Typography variant="body2">{benefit}</Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      {/* New Appointment Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule New Appointment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Client Name"
              fullWidth
              placeholder="Enter client name"
            />
            <TextField
              label="Appointment Type"
              select
              fullWidth
              defaultValue="consultation"
            >
              <MenuItem value="consultation">Consultation</MenuItem>
              <MenuItem value="demo">Product Demo</MenuItem>
              <MenuItem value="meeting">Meeting</MenuItem>
              <MenuItem value="call">Phone Call</MenuItem>
            </TextField>
            <TextField
              label="Date & Time"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Duration (minutes)"
              type="number"
              fullWidth
              defaultValue={60}
            />
            <Alert severity="info" icon={<NotificationsActive />}>
              Automated reminders will be sent 48h, 24h, and day-of appointment
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenDialog(false)}>
            Schedule Appointment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FlowTime;
