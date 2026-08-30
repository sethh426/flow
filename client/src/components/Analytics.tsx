'use client';

import { Box, Typography, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockData = [
  { name: 'Jan', users: 400, sessions: 240 },
  { name: 'Feb', users: 300, sessions: 139 },
  { name: 'Mar', users: 200, sessions: 980 },
  { name: 'Apr', users: 278, sessions: 390 },
  { name: 'May', users: 189, sessions: 480 },
  { name: 'Jun', users: 239, sessions: 380 },
];

export default function Analytics() {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Analytics Dashboard
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            User Analytics
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#8884d8" />
              <Bar dataKey="sessions" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );
}