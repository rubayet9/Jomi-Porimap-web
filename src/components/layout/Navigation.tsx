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
    { key: 'CALCULATOR', icon: <Calculator size={18} />, labelKey: 'tab_calculator', shortLabelKey: 'tab_calculator_short' },
    { key: 'TRIANGULATION', icon: <Shapes size={18} />, labelKey: 'tab_triangulation', shortLabelKey: 'tab_triangulation_short' },
    { key: 'KHATIAN', icon: <Scale size={18} />, labelKey: 'tab_khatian', shortLabelKey: 'tab_khatian_short' },
    { key: 'AI_ASSISTANT', icon: <Bot size={18} />, labelKey: 'tab_ai', shortLabelKey: 'tab_ai_short' },
    { key: 'HISTORY', icon: <History size={18} />, labelKey: 'tab_history', shortLabelKey: 'tab_history_short' },
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
            title={getTranslation(tab.labelKey, lang)}
          >
            <span className="tab-icon-wrap">{tab.icon}</span>
            <span className="tab-label-desktop">{getTranslation(tab.labelKey, lang)}</span>
            <span className="tab-label-mobile">{getTranslation(tab.shortLabelKey, lang)}</span>
          </button>
        );
      })}
    </nav>
  );
};
