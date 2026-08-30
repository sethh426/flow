'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  MenuItem,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  FormControlLabel,
  Chip,
  Stack,
  LinearProgress,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import {
  Business,
  TrendingUp,
  AttachMoney,
  Schedule,
  CheckCircle,
  ArrowForward,
  ArrowBack,
} from '@mui/icons-material';

// Business verticals with metadata
const BUSINESS_VERTICALS = {
  dropshipping: {
    name: 'Online Retail / Dropshipping',
    icon: '📦',
    conversionRate: '6.82%',
    color: '#2196f3',
    keywords: ['ecommerce', 'shopify', 'woocommerce', 'online store', 'retail'],
  },
  realEstate: {
    name: 'Real Estate',
    icon: '🏡',
    conversionRate: '20%+',
    color: '#4caf50',
    keywords: ['realtor', 'real estate', 'property', 'homes', 'listings'],
  },
  automotive: {
    name: 'Automotive Dealership',
    icon: '🚗',
    conversionRate: '52% profit',
    color: '#ff9800',
    keywords: ['dealership', 'cars', 'auto', 'vehicles', 'automotive'],
  },
  tradeServices: {
    name: 'Trade Services',
    icon: '🔧',
    conversionRate: '35% revenue',
    color: '#9c27b0',
    keywords: ['plumber', 'electrician', 'hvac', 'contractor', 'handyman'],
  },
  digitalProducts: {
    name: 'Digital Products / SaaS',
    icon: '💻',
    conversionRate: '8-15%',
    color: '#00bcd4',
    keywords: ['saas', 'software', 'digital', 'online course', 'ebook'],
  },
  personalBrand: {
    name: 'Personal Brand / Creator',
    icon: '⭐',
    conversionRate: '$10M-$20M',
    color: '#e91e63',
    keywords: ['coach', 'consultant', 'speaker', 'influencer', 'creator'],
  },
};

interface OnboardingData {
  // Step 1: Business Basics
  businessName: string;
  industry: string;
  website: string;
  
  // Step 2: Business Classification
  businessType: string;
  monthlyRevenue: string;
  teamSize: string;
  
  // Step 3: Goals & Priorities
  primaryGoal: string;
  secondaryGoals: string[];
  
  // Step 4: Current Challenges
  biggestChallenge: string;
  currentTools: string;
  
  // Step 5: Automation Preferences
  automationLevel: string;
  timeToValue: string;
}

const OnboardingPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<OnboardingData>({
    businessName: '',
    industry: '',
    website: '',
    businessType: '',
    monthlyRevenue: '',
    teamSize: '',
    primaryGoal: '',
    secondaryGoals: [],
    biggestChallenge: '',
    currentTools: '',
    automationLevel: '',
    timeToValue: '',
  });
  const [classificationConfidence, setClassificationConfidence] = useState(0);
  const [recommendedVertical, setRecommendedVertical] = useState<string | null>(null);

  const steps = [
    'Business Basics',
    'Classification',
    'Goals & Priorities',
    'Current Challenges',
    'Automation Setup',
  ];

  const handleNext = () => {
    // Run classification after step 2
    if (activeStep === 1) {
      classifyBusiness();
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (field: keyof OnboardingData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Simple rule-based classifier (will be enhanced with ML later)
  const classifyBusiness = () => {
    const keywords = `${formData.businessName} ${formData.industry} ${formData.website}`.toLowerCase();
    
    let bestMatch = '';
    let highestScore = 0;

    Object.entries(BUSINESS_VERTICALS).forEach(([key, vertical]) => {
      let score = 0;
      vertical.keywords.forEach((keyword) => {
        if (keywords.includes(keyword.toLowerCase())) {
          score += 25;
        }
      });
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = key;
      }
    });

    // Calculate confidence (simple heuristic)
    const confidence = Math.min(95, highestScore + 20);
    setClassificationConfidence(confidence);
    setRecommendedVertical(bestMatch || 'digitalProducts');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Tell us about your business
            </Typography>
            <TextField
              fullWidth
              label="Business Name"
              value={formData.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              required
              helperText="What's your business called?"
            />
            <TextField
              fullWidth
              label="Industry / Description"
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              required
              helperText="E.g., 'Real estate agent in Austin' or 'Shopify dropshipping store'"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Website (optional)"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              helperText="Your website URL if you have one"
            />
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Business Classification
            </Typography>
            <FormControl fullWidth>
              <FormLabel>What best describes your business model?</FormLabel>
              <RadioGroup
                value={formData.businessType}
                onChange={(e) => handleChange('businessType', e.target.value)}
              >
                {Object.entries(BUSINESS_VERTICALS).map(([key, vertical]) => (
                  <FormControlLabel
                    key={key}
                    value={key}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: '24px' }}>{vertical.icon}</span>
                        <Box>
                          <Typography variant="body1">{vertical.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Avg conversion: {vertical.conversionRate}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
            <TextField
              select
              fullWidth
              label="Monthly Revenue"
              value={formData.monthlyRevenue}
              onChange={(e) => handleChange('monthlyRevenue', e.target.value)}
            >
              <MenuItem value="0-10k">$0 - $10,000</MenuItem>
              <MenuItem value="10k-50k">$10,000 - $50,000</MenuItem>
              <MenuItem value="50k-100k">$50,000 - $100,000</MenuItem>
              <MenuItem value="100k-500k">$100,000 - $500,000</MenuItem>
              <MenuItem value="500k+">$500,000+</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              label="Team Size"
              value={formData.teamSize}
              onChange={(e) => handleChange('teamSize', e.target.value)}
            >
              <MenuItem value="solo">Just me</MenuItem>
              <MenuItem value="2-5">2-5 people</MenuItem>
              <MenuItem value="6-20">6-20 people</MenuItem>
              <MenuItem value="21-50">21-50 people</MenuItem>
              <MenuItem value="50+">50+ people</MenuItem>
            </TextField>
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              What are your goals?
            </Typography>
            
            {recommendedVertical && classificationConfidence > 70 && (
              <Alert severity="success" icon={<CheckCircle />}>
                <Typography variant="body2" fontWeight="bold">
                  We recommend the{' '}
                  {BUSINESS_VERTICALS[recommendedVertical as keyof typeof BUSINESS_VERTICALS].name}{' '}
                  workflow (Confidence: {classificationConfidence}%)
                </Typography>
              </Alert>
            )}

            <FormControl fullWidth>
              <FormLabel>Primary Goal (choose one)</FormLabel>
              <RadioGroup
                value={formData.primaryGoal}
                onChange={(e) => handleChange('primaryGoal', e.target.value)}
              >
                <FormControlLabel
                  value="increase-conversions"
                  control={<Radio />}
                  label="Increase conversion rate"
                />
                <FormControlLabel
                  value="reduce-response-time"
                  control={<Radio />}
                  label="Reduce response time to leads"
                />
                <FormControlLabel
                  value="automate-follow-ups"
                  control={<Radio />}
                  label="Automate follow-up sequences"
                />
                <FormControlLabel
                  value="recover-abandoned"
                  control={<Radio />}
                  label="Recover abandoned carts/leads"
                />
                <FormControlLabel
                  value="scale-operations"
                  control={<Radio />}
                  label="Scale operations without hiring"
                />
              </RadioGroup>
            </FormControl>

            <TextField
              select
              fullWidth
              label="How soon do you need results?"
              value={formData.timeToValue}
              onChange={(e) => handleChange('timeToValue', e.target.value)}
            >
              <MenuItem value="immediate">Immediately (this week)</MenuItem>
              <MenuItem value="short">Short-term (1-2 months)</MenuItem>
              <MenuItem value="medium">Medium-term (3-6 months)</MenuItem>
              <MenuItem value="long">Long-term (6+ months)</MenuItem>
            </TextField>
          </Stack>
        );

      case 3:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Current Challenges
            </Typography>
            <TextField
              fullWidth
              label="What's your biggest challenge right now?"
              value={formData.biggestChallenge}
              onChange={(e) => handleChange('biggestChallenge', e.target.value)}
              multiline
              rows={3}
              required
              helperText="Be specific - this helps us customize your workflow"
            />
            <TextField
              fullWidth
              label="What tools are you currently using?"
              value={formData.currentTools}
              onChange={(e) => handleChange('currentTools', e.target.value)}
              multiline
              rows={2}
              helperText="E.g., Shopify, HubSpot, Mailchimp, etc."
            />
          </Stack>
        );

      case 4:
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom>
              Automation Preferences
            </Typography>
            <FormControl fullWidth>
              <FormLabel>How much automation do you want?</FormLabel>
              <RadioGroup
                value={formData.automationLevel}
                onChange={(e) => handleChange('automationLevel', e.target.value)}
              >
                <FormControlLabel
                  value="minimal"
                  control={<Radio />}
                  label="Minimal - I want to review everything"
                />
                <FormControlLabel
                  value="moderate"
                  control={<Radio />}
                  label="Moderate - Automate routine tasks, notify me for important ones"
                />
                <FormControlLabel
                  value="aggressive"
                  control={<Radio />}
                  label="Aggressive - Automate everything possible, just show me results"
                />
              </RadioGroup>
            </FormControl>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>Your Personalized Setup</strong>
              </Typography>
              <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                Based on your responses, we'll configure:
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                <li>
                  <Typography variant="caption">
                    {BUSINESS_VERTICALS[recommendedVertical as keyof typeof BUSINESS_VERTICALS]?.name || 'Custom'} workflow template
                  </Typography>
                </li>
                <li>
                  <Typography variant="caption">
                    {formData.automationLevel === 'aggressive' ? 'Fully automated' : 
                     formData.automationLevel === 'moderate' ? 'Semi-automated' : 
                     'Manual approval'} processes
                  </Typography>
                </li>
                <li>
                  <Typography variant="caption">
                    Integrations with: {formData.currentTools || 'your existing tools'}
                  </Typography>
                </li>
              </Box>
            </Alert>
          </Stack>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return formData.businessName && formData.industry;
      case 1:
        return formData.businessType && formData.monthlyRevenue && formData.teamSize;
      case 2:
        return formData.primaryGoal && formData.timeToValue;
      case 3:
        return formData.biggestChallenge;
      case 4:
        return formData.automationLevel;
      default:
        return false;
    }
  };

  const handleComplete = () => {
    // Save onboarding data and redirect to recommended workflow
    console.log('Onboarding Complete:', formData);
    console.log('Recommended Vertical:', recommendedVertical);
    console.log('Confidence:', classificationConfidence);
    
    // Redirect to workflow builder with pre-configured template
    window.location.href = `/workflows?template=${recommendedVertical}&onboarding=complete`;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Welcome to Affiliate Flow! 🚀
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Let's get you set up in less than 5 minutes
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(activeStep / steps.length) * 100}
          sx={{ mt: 3, mb: 2, height: 8, borderRadius: 4 }}
        />
        <Typography variant="caption" color="text.secondary">
          Step {activeStep + 1} of {steps.length}
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Content Card */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          {renderStepContent(activeStep)}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<ArrowBack />}
        >
          Back
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => (window.location.href = '/dashboard')}
          >
            Save & Exit
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleComplete}
              disabled={!isStepValid()}
              endIcon={<CheckCircle />}
            >
              Complete Setup
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepValid()}
              endIcon={<ArrowForward />}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default OnboardingPage;
