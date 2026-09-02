'use client';

import { useState } from 'react';
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

export default function DashboardPage() {
  const [currentTab, setCurrentTab] = useState(0);
  const [user] = useState({ email: 'demo@affiliateflow.com', uid: 'demo-user' });

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
        return <WorkflowBuilderFlowbite onSave={(workflow: unknown) => console.log('Saving workflow:', workflow)} onExecute={(workflow: unknown) => console.log('Executing workflow:', workflow)} />;
      case 10:
        return <ContentSchedulerFlowbite />;
      case 11:
        return <PrintifyStudioFlowbite />;
      default:
        return <DashboardContentFlowbite />;
    }
  };

  return (
    <DashboardLayoutFlowbite currentTab={currentTab} onTabChange={setCurrentTab} user={user}>
      {renderTabContent()}
    </DashboardLayoutFlowbite>
  );
}

