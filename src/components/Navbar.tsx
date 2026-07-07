import React from 'react';
import { 
  Flame, 
  Droplet, 
  Sparkles, 
  Utensils, 
  Dumbbell, 
  HeartHandshake, 
  BarChart3, 
  Settings, 
  Volume2, 
  VolumeX, 
  CalendarCheck 
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userProfile: UserProfile;
  todayWater: number;
  onAddWater: (amount: number) => void;
  onToggleSound: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  todayWater,
  onAddWater,
  onToggleSound,
  onOpenProfile
}) => {
  const tabs = [
    { id: 'daily', label: 'Daily Guide', icon: CalendarCheck },
    { id: 'nutrition', label: 'Nutrition & Recipes', icon: Utensils },
    { id: 'workouts', label: 'Workouts & Movement', icon: Dumbbell },
    { id: 'mindfulness', label: 'Mindful Meditation', icon: HeartHandshake },
    { id: 'scorecard', label: 'Vitality Scorecard', icon: BarChart3 },
    { id: 'aicoach', label: 'AI Health Coach', icon: Sparkles, badge: 'AI' },
  ];

  const waterPercent = Math.min(100, Math.round((todayWater / userProfile.targetWaterMl) * 100));

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row */}
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('daily')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-700 to-teal-800 bg-clip-text text-transparent">
                  Vitality
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  Daily Guide
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                Personalized nutrition, movement & mindfulness
              </p>
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full border border-amber-200/60 text-xs sm:text-sm font-semibold shadow-2xs" title="Consecutive days logged">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{userProfile.streakDays} Day Streak</span>
            </div>

            {/* Quick Water Widget */}
            <div className="hidden md:flex items-center gap-2 bg-blue-50/80 border border-blue-200/60 rounded-full px-3 py-1 text-xs">
              <Droplet className="w-4 h-4 text-blue-500 fill-blue-500 animate-bounce" />
              <div className="flex flex-col">
                <span className="font-semibold text-blue-900">
                  {todayWater} / {userProfile.targetWaterMl} ml
                </span>
              </div>
              <button
                onClick={() => onAddWater(250)}
                className="ml-1 bg-blue-500 hover:bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full text-xs transition-colors shadow-2xs"
                title="Add 250ml glass of water"
              >
                +250ml
              </button>
            </div>

            {/* Audio Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-2 rounded-lg border transition-colors ${
                userProfile.soundEnabled 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}
              title={userProfile.soundEnabled ? 'Ambient Audio Enabled' : 'Audio Muted'}
            >
              {userProfile.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Profile / Goal Selector Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{userProfile.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>

        {/* Bottom Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-gray-100 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-semibold'
                    : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
