'use client';

import { useState } from 'react';
import { Button, Tooltip } from 'flowbite-react';
import { 
  HiMenu, HiX, HiHome, HiSpeakerphone, HiShoppingCart, 
  HiSparkles, HiTrendingUp, HiChartBar, HiCog, HiPrinter 
} from 'react-icons/hi';

interface QuickNavigationProps {
  currentTab: number;
  onTabChange: (tab: number) => void;
}

export default function QuickNavigation({ currentTab, onTabChange }: QuickNavigationProps) {
  const [open, setOpen] = useState(false);

  const actions = [
    { icon: HiHome, name: 'Dashboard', tab: 0 },
    { icon: HiSpeakerphone, name: 'Campaigns', tab: 1 },
    { icon: HiShoppingCart, name: 'Products', tab: 2 },
    { icon: HiSparkles, name: 'AI Studio', tab: 3 },
    { icon: HiTrendingUp, name: 'Trends', tab: 4 },
    { icon: HiChartBar, name: 'Analytics', tab: 5 },
    { icon: HiCog, name: 'Workflows', tab: 9 },
    { icon: HiPrinter, name: 'Printify', tab: 11 },
  ];

  const handleAction = (tab: number) => {
    onTabChange(tab);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50">
      {/* Action Buttons */}
      <div className={`flex flex-col-reverse gap-3 mb-3 transition-all duration-300 ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}`}>
        {actions.map((action) => {
          const Icon = action.icon;
          const isActive = currentTab === action.tab;
          return (
            <Tooltip key={action.tab} content={action.name} placement="left">
              <Button
                onClick={() => handleAction(action.tab)}
                size="lg"
                pill
                className={`${
                  isActive 
                    ? 'bg-linear-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                } transition-all duration-300 transform hover:scale-110`}
              >
                <Icon className="h-5 w-5" />
              </Button>
            </Tooltip>
          );
        })}
      </div>

      {/* Main Floating Action Button */}
      <Button
        onClick={() => setOpen(!open)}
        pill
        size="xl"
        className="bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-2xl shadow-purple-500/50 transform hover:scale-110 transition-all duration-300"
      >
        {open ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
      </Button>
    </div>
  );
}
