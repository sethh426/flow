'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from 'flowbite-react';
import DashboardLayoutFlowbite from '@/core/layout/DashboardLayoutFlowbite';
import DashboardContentFlowbite from '@/core/layout/DashboardContentFlowbite';
import CampaignManagerFlowbite from '@/features/campaigns/CampaignManagerFlowbite';
import ProductsPageFlowbite from '@/features/products/ProductsPageFlowbite';
// import ContentStudio from '@/features/content-studio/ContentStudio'; // Temporarily disabled
import TrendFinderFlowbite from '@/features/trends/TrendFinderFlowbite';
import AnalyticsDashboardFlowbite from '@/features/analytics/AnalyticsDashboardFlowbite';
import ABTestingFlowbite from '@/features/analytics/ABTestingFlowbite';
import FlowChartFlowbite from '@/features/workflow/FlowChartFlowbite';
import FlowCoinsFlowbite from '@/features/workflow/FlowCoinsFlowbite';
import WorkflowBuilderFlowbite from '@/features/workflow/WorkflowBuilderFlowbite';
import ContentSchedulerFlowbite from '@/features/content-studio/ContentSchedulerFlowbite';
import PrintifyStudioFlowbite from '@/features/printify-studio/PrintifyStudioFlowbite';
import AuthDialog from '@/features/auth/AuthDialog';
import QuickNavigation from '@/components/QuickNavigation';

export default function DashboardPage() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(0);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [user, setUser] = useState<any>({ email: 'demo@affiliateflow.com', uid: 'demo-user' });
  const [loading, setLoading] = useState(false);

  // Bypass auth check - set demo user immediately
  useEffect(() => {
    console.log('Dashboard loaded with demo user');
  }, [router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" className="fill-purple-600" />
      </div>
    );
  }

  // Don't render dashboard if no user (should never happen due to redirect, but just in case)
  if (!user) {
    return null;
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return <DashboardContentFlowbite />;
      case 1:
        return <CampaignManagerFlowbite />;
      case 2:
        return <ProductsPageFlowbite />;
      case 3:
        return <div className="p-6 flex items-center gap-3"><Spinner /> Content Studio loading...</div>;
      case 4:
        return <TrendFinderFlowbite />;
      case 5:
        return <AnalyticsDashboardFlowbite />;
      case 6:
        return <ABTestingFlowbite />;
      case 7:
        return <FlowChartFlowbite />;
      case 8:
        return <FlowCoinsFlowbite />;
      case 9:
        return <WorkflowBuilderFlowbite onSave={(workflow: any) => console.log('Saving workflow:', workflow)} onExecute={(workflow: any) => console.log('Executing workflow:', workflow)} />;
      case 10:
        return <ContentSchedulerFlowbite />;
      case 11:
        return <PrintifyStudioFlowbite />;
      default:
        return <DashboardContentFlowbite />;
    }
  };

  return (
    <>
      <DashboardLayoutFlowbite currentTab={currentTab} onTabChange={setCurrentTab} user={user}>
        {renderTabContent()}
      </DashboardLayoutFlowbite>
      
      <QuickNavigation currentTab={currentTab} onTabChange={setCurrentTab} />
      
      <AuthDialog open={authDialogOpen} onClose={() => setAuthDialogOpen(false)} />
    </>
  );
}

