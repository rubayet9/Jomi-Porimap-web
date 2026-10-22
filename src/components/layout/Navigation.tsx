import React from 'react';
import { Calculator, Shapes, Scale, Bot, History } from 'lucide-react';
import { AppLanguage, AppTab } from '../../types';
import { getTranslation } from '../../lib/translations';
import { sound } from '../../lib/sound';

interface NavigationProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  lang: AppLanguage;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  lang,
}) => {
  const tabs = [
    { key: 'CALCULATOR', icon: <Calculator size={18} />, labelKey: 'tab_calculator' },
    { key: 'TRIANGULATION', icon: <Shapes size={18} />, labelKey: 'tab_triangulation' },
    { key: 'KHATIAN', icon: <Scale size={18} />, labelKey: 'tab_khatian' },
    { key: 'AI_ASSISTANT', icon: <Bot size={18} />, labelKey: 'tab_ai' },
    { key: 'HISTORY', icon: <History size={18} />, labelKey: 'tab_history' },
  ];

  const handleTabClick = (tabKey: string) => {
    sound.playClick();
    onSelectTab(tabKey as AppTab);
  };

  return (
    <nav className="tab-bar-container" style={{ marginBottom: '20px' }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabClick(tab.key)}
            className={`tab-btn ${isActive ? 'active' : ''}`}
          >
            <span>{tab.icon}</span>
            <span>{getTranslation(tab.labelKey, lang)}</span>
          </button>
        );
      })}
    </nav>
  );
};
