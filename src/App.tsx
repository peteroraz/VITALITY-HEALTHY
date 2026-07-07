/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DailyGuideView } from './components/DailyGuideView';
import { NutritionView } from './components/NutritionView';
import { WorkoutsView } from './components/WorkoutsView';
import { MindfulnessView } from './components/MindfulnessView';
import { ScorecardView } from './components/ScorecardView';
import { AICoachView } from './components/AICoachView';
import { ProfileModal } from './components/ProfileModal';
import { 
  initialProfile, 
  defaultMeals, 
  defaultWorkouts, 
  defaultMeditations, 
  mockHistoricalLogs 
} from './data/defaultPlans';
import { UserProfile, DailyLog, MealPlanItem, WorkoutRoutine, MeditationSession } from './types';

const STORAGE_KEY_PROFILE = 'vitality_user_profile_v1';
const STORAGE_KEY_LOGS = 'vitality_daily_logs_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('daily');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Load or initialize user profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      return saved ? JSON.parse(saved) : initialProfile;
    } catch (e) {
      return initialProfile;
    }
  });

  // Load or initialize daily logs
  const [logs, setLogs] = useState<DailyLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOGS);
      return saved ? JSON.parse(saved) : mockHistoricalLogs;
    } catch (e) {
      return mockHistoricalLogs;
    }
  });

  const [meals] = useState<MealPlanItem[]>(defaultMeals);
  const [workouts] = useState<WorkoutRoutine[]>(defaultWorkouts);
  const [meditations] = useState<MeditationSession[]>(defaultMeditations);

  // Ensure today's log exists
  const todayString = new Date().toISOString().slice(0, 10);
  const todayLog = logs.find(l => l.dateString === todayString) || {
    dateString: todayString,
    waterMl: 0,
    sleepHours: 7.5,
    moodScore: 4,
    energyScore: 4,
    completedMealIds: [],
    completedWorkoutIds: [],
    completedMeditationIds: []
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
    } catch (e) {}
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    } catch (e) {}
  }, [logs]);

  // Update today's log helper
  const handleUpdateTodayLog = (updater: (prev: DailyLog) => DailyLog) => {
    setLogs(prevLogs => {
      const existingIdx = prevLogs.findIndex(l => l.dateString === todayString);
      if (existingIdx >= 0) {
        const updated = [...prevLogs];
        updated[existingIdx] = updater(updated[existingIdx]);
        return updated;
      } else {
        return [...prevLogs, updater(todayLog)];
      }
    });
  };

  const handleToggleMeal = (id: string) => {
    handleUpdateTodayLog(prev => {
      const isDone = prev.completedMealIds.includes(id);
      return {
        ...prev,
        completedMealIds: isDone ? prev.completedMealIds.filter(i => i !== id) : [...prev.completedMealIds, id]
      };
    });
  };

  const handleToggleWorkout = (id: string) => {
    handleUpdateTodayLog(prev => {
      const isDone = prev.completedWorkoutIds.includes(id);
      return {
        ...prev,
        completedWorkoutIds: isDone ? prev.completedWorkoutIds.filter(i => i !== id) : [...prev.completedWorkoutIds, id]
      };
    });
  };

  const handleToggleMeditation = (id: string) => {
    handleUpdateTodayLog(prev => {
      const isDone = prev.completedMeditationIds.includes(id);
      return {
        ...prev,
        completedMeditationIds: isDone ? prev.completedMeditationIds.filter(i => i !== id) : [...prev.completedMeditationIds, id]
      };
    });
  };

  const handleAddWater = (ml: number) => {
    handleUpdateTodayLog(prev => ({
      ...prev,
      waterMl: Math.max(0, prev.waterMl + ml)
    }));
  };

  const handleToggleSound = () => {
    setUserProfile(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const handleResetData = () => {
    setUserProfile(initialProfile);
    setLogs(mockHistoricalLogs);
    try {
      localStorage.removeItem(STORAGE_KEY_PROFILE);
      localStorage.removeItem(STORAGE_KEY_LOGS);
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100 font-sans text-gray-900 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        todayWater={todayLog.waterMl}
        onAddWater={handleAddWater}
        onToggleSound={handleToggleSound}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'daily' && (
          <DailyGuideView
            userProfile={userProfile}
            todayLog={todayLog}
            onUpdateLog={handleUpdateTodayLog}
            meals={meals}
            workouts={workouts}
            meditations={meditations}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionView
            meals={meals}
            completedMealIds={todayLog.completedMealIds}
            onToggleMeal={handleToggleMeal}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'workouts' && (
          <WorkoutsView
            workouts={workouts}
            completedWorkoutIds={todayLog.completedWorkoutIds}
            onToggleWorkout={handleToggleWorkout}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'mindfulness' && (
          <MindfulnessView
            meditations={meditations}
            completedMeditationIds={todayLog.completedMeditationIds}
            onToggleMeditation={handleToggleMeditation}
            userProfile={userProfile}
            todayLog={todayLog}
            onUpdateLog={handleUpdateTodayLog}
          />
        )}

        {activeTab === 'scorecard' && (
          <ScorecardView
            logs={logs}
            userProfile={userProfile}
          />
        )}

        {activeTab === 'aicoach' && (
          <AICoachView
            userProfile={userProfile}
          />
        )}
      </main>

      <footer className="bg-white border-t border-gray-100 py-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>Vitality — Your Personalized Daily Healthy Living Guide • Designed for compound daily consistency 🌱</p>
        </div>
      </footer>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        userProfile={userProfile}
        onUpdateProfile={setUserProfile}
        onResetData={handleResetData}
      />
    </div>
  );
}
