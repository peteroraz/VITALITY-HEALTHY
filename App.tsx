/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { AuthScreen } from './auth/AuthScreen';
import { useAuth } from './auth/AuthProvider';
import { PENDING_DISPLAY_NAME_KEY } from './auth/constants';
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
} from './data/defaultPlans';
import {
  loadOrCreateUserData,
  replaceUserData,
  saveDailyLog,
  saveUserProfile,
} from './data/userData';
import { UserProfile, DailyLog, MealPlanItem, WorkoutRoutine, MeditationSession } from './types';

const STORAGE_KEY_PROFILE = 'vitality_user_profile_v1';
const STORAGE_KEY_LOGS = 'vitality_daily_logs_v1';

export default function App() {
  const { user, loading, configurationError, signOutUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center text-emerald-700">
        <LoaderCircle className="w-8 h-8 animate-spin" aria-label="Checking login" />
      </div>
    );
  }

  if (!user) return <AuthScreen configurationError={configurationError} />;

  return (
    <VitalityApp
      uid={user.uid}
      displayName={user.displayName || user.email?.split('@')[0] || 'Vitality User'}
      email={user.email || ''}
      onSignOut={signOutUser}
    />
  );
}

interface VitalityAppProps {
  uid: string;
  displayName: string;
  email: string;
  onSignOut: () => Promise<void>;
}

function VitalityApp({ uid, displayName, email, onSignOut }: VitalityAppProps) {
  const [activeTab, setActiveTab] = useState<string>('daily');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const pendingDisplayName = sessionStorage.getItem(PENDING_DISPLAY_NAME_KEY);
  const cleanInitialProfile: UserProfile = {
    ...initialProfile,
    name: pendingDisplayName || displayName,
    streakDays: 0,
  };
  const [userProfile, setUserProfile] = useState<UserProfile>(cleanInitialProfile);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const logsRef = useRef<DailyLog[]>([]);

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

  useEffect(() => {
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);

    loadOrCreateUserData(uid, cleanInitialProfile, [])
      .then((data) => {
        if (cancelled) return;
        setUserProfile(data.profile);
        logsRef.current = data.logs;
        setLogs(data.logs);
        localStorage.removeItem(STORAGE_KEY_PROFILE);
        localStorage.removeItem(STORAGE_KEY_LOGS);
        sessionStorage.removeItem(PENDING_DISPLAY_NAME_KEY);
        setDataLoading(false);
      })
      .catch((error) => {
        console.error('Unable to load private user data:', error);
        if (!cancelled) {
          setDataError('We could not securely load your wellness data. Check your connection and Firestore rules, then try again.');
          setDataLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const reportSaveError = (error: unknown) => {
    console.error('Unable to save user data:', error);
    setSaveError('Your latest change could not be saved. Please check your connection and try again.');
  };

  const handleUpdateProfile = (nextProfile: UserProfile) => {
    setUserProfile(nextProfile);
    setSaveError(null);
    void saveUserProfile(uid, nextProfile).catch(reportSaveError);
  };

  // Update today's log helper
  const handleUpdateTodayLog = (updater: (prev: DailyLog) => DailyLog) => {
    const currentLogs = logsRef.current;
    const existingIdx = currentLogs.findIndex((log) => log.dateString === todayString);
    const nextLog = updater(existingIdx >= 0 ? currentLogs[existingIdx] : todayLog);
    const nextLogs = existingIdx >= 0
      ? currentLogs.map((log, index) => index === existingIdx ? nextLog : log)
      : [...currentLogs, nextLog];

    logsRef.current = nextLogs;
    setLogs(nextLogs);
    setSaveError(null);
    void saveDailyLog(uid, nextLog).catch(reportSaveError);
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
    handleUpdateProfile({ ...userProfile, soundEnabled: !userProfile.soundEnabled });
  };

  const handleResetData = () => {
    const resetProfile = { ...initialProfile, name: userProfile.name, streakDays: 0 };
    logsRef.current = [];
    setUserProfile(resetProfile);
    setLogs([]);
    setSaveError(null);
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_LOGS);
    void replaceUserData(uid, resetProfile, []).catch(reportSaveError);
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center gap-3 text-emerald-800">
        <LoaderCircle className="w-8 h-8 animate-spin" />
        <p className="text-sm font-semibold">Loading your private wellness data…</p>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen bg-emerald-50 px-4 flex items-center justify-center">
        <div className="max-w-md rounded-2xl bg-white border border-rose-200 p-6 text-center shadow-lg">
          <h1 className="text-lg font-bold text-gray-900">Secure data connection failed</h1>
          <p className="mt-2 text-sm text-gray-600">{dataError}</p>
          <div className="mt-5 flex justify-center gap-3">
            <button onClick={() => window.location.reload()} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white">Try again</button>
            <button onClick={() => void onSignOut()} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">Sign out</button>
          </div>
        </div>
      </div>
    );
  }

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
        userEmail={email}
        onSignOut={onSignOut}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {saveError && (
          <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {saveError}
          </div>
        )}
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
        onUpdateProfile={handleUpdateProfile}
        onResetData={handleResetData}
      />
    </div>
  );
}
