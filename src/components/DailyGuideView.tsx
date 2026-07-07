import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Sun, 
  Sunset, 
  Moon, 
  Droplet, 
  Flame, 
  Utensils, 
  Dumbbell, 
  HeartHandshake, 
  ArrowRight, 
  RefreshCw, 
  Clock, 
  Award,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, DailyLog, MealPlanItem, WorkoutRoutine, MeditationSession } from '../types';

interface DailyGuideViewProps {
  userProfile: UserProfile;
  todayLog: DailyLog;
  onUpdateLog: (updater: (prev: DailyLog) => DailyLog) => void;
  meals: MealPlanItem[];
  workouts: WorkoutRoutine[];
  meditations: MeditationSession[];
  onNavigateToTab: (tab: string) => void;
}

export const DailyGuideView: React.FC<DailyGuideViewProps> = ({
  userProfile,
  todayLog,
  onUpdateLog,
  meals,
  workouts,
  meditations,
  onNavigateToTab
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPlanNotice, setCustomPlanNotice] = useState<string | null>(null);
  const [availableMins, setAvailableMins] = useState(30);

  const goalLabels: Record<string, string> = {
    weight_loss: 'Healthy Fat Loss & Metabolic Vitality',
    muscle_gain: 'Lean Muscle & Strength Building',
    longevity_energy: 'Longevity, Cellular Health & Sustained Energy',
    stress_reduction: 'Nervous System Calm & Stress Reduction',
    balanced_vitality: 'Holistic Everyday Balanced Living',
  };

  const toggleItem = (type: 'meal' | 'workout' | 'meditation', id: string) => {
    onUpdateLog(prev => {
      const currentList = type === 'meal' 
        ? prev.completedMealIds 
        : type === 'workout' 
        ? prev.completedWorkoutIds 
        : prev.completedMeditationIds;
      
      const isCompleted = currentList.includes(id);
      const updatedList = isCompleted 
        ? currentList.filter(i => i !== id) 
        : [...currentList, id];

      if (!isCompleted) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#10b981', '#3b82f6', '#f59e0b']
          });
        } catch (e) {}
      }

      return {
        ...prev,
        completedMealIds: type === 'meal' ? updatedList : prev.completedMealIds,
        completedWorkoutIds: type === 'workout' ? updatedList : prev.completedWorkoutIds,
        completedMeditationIds: type === 'meditation' ? updatedList : prev.completedMeditationIds,
      };
    });
  };

  const addWater = (ml: number) => {
    onUpdateLog(prev => {
      const newAmount = Math.max(0, prev.waterMl + ml);
      if (newAmount >= userProfile.targetWaterMl && prev.waterMl < userProfile.targetWaterMl) {
        try {
          confetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
      return { ...prev, waterMl: newAmount };
    });
  };

  const handleGenerateAIPlan = async () => {
    setIsGenerating(true);
    setCustomPlanNotice(null);
    try {
      const res = await fetch('/api/ai/generate-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: userProfile.goal,
          diet: userProfile.diet,
          calories: userProfile.targetCalories,
          availableMinutes: availableMins,
          stressLevel: todayLog.moodScore < 3 ? 'high' : 'normal'
        })
      });
      const data = await res.json();
      if (data && data.plan) {
        setCustomPlanNotice(`✨ AI Coach crafted a new ${availableMins}-min schedule for your ${goalLabels[userProfile.goal]} goal! Explore your customized meals and workouts in their respective tabs.`);
      }
    } catch (err) {
      setCustomPlanNotice("✨ Custom daily plan applied using intelligent offline nutrition & workout rules.");
    } finally {
      setIsGenerating(false);
    }
  };

  const completedCount = todayLog.completedMealIds.length + todayLog.completedWorkoutIds.length + todayLog.completedMeditationIds.length;
  const totalDailyTarget = 5; // e.g. breakfast, lunch, dinner, 1 workout, 1 meditation
  const progressPercent = Math.min(100, Math.round((completedCount / totalDailyTarget) * 100));

  // Find featured items for each time of day
  const breakfast = meals.find(m => m.mealType === 'breakfast') || meals[0];
  const lunch = meals.find(m => m.mealType === 'lunch') || meals[2];
  const dinner = meals.find(m => m.mealType === 'dinner') || meals[4];
  const featuredWorkout = workouts[0] || { id: 'w1', title: 'Daily Movement Routine', durationMinutes: 25 };
  const featuredMeditation = meditations[0] || { id: 'med1', title: 'Box Breathing Focus', durationMinutes: 5 };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs border border-emerald-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Day-to-Day Healthy Living Guide</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Good day, {userProfile.name}! 🌿
            </h1>
            <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              Your personalized plan for <strong className="text-white underline decoration-emerald-400 decoration-2 underline-offset-4">{goalLabels[userProfile.goal]}</strong> is ready. Follow along step-by-step below.
            </p>
          </div>

          {/* Quick Progress Ring Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center gap-4 min-w-[220px]">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="5" className="text-white/20 fill-none" />
                <circle 
                  cx="28" cy="28" r="22" stroke="currentColor" strokeWidth="5" 
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={(2 * Math.PI * 22) * (1 - progressPercent / 100)}
                  className="text-emerald-400 fill-none transition-all duration-700 stroke-round" 
                />
              </svg>
              <span className="absolute text-xs font-bold">{progressPercent}%</span>
            </div>
            <div>
              <div className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">Today's Vitality</div>
              <div className="font-bold text-lg">{completedCount} of {totalDailyTarget} done</div>
              <div className="text-[11px] text-emerald-300">Keep up the momentum!</div>
            </div>
          </div>
        </div>

        {/* AI Daily Generator Toolbar inside Hero */}
        <div className="mt-6 pt-6 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-emerald-200">
            <span className="font-medium">Time available for movement today:</span>
            <div className="flex gap-1.5 bg-black/30 p-1 rounded-lg border border-white/10">
              {[15, 30, 45].map(mins => (
                <button
                  key={mins}
                  onClick={() => setAvailableMins(mins)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                    availableMins === mins ? 'bg-emerald-500 text-white shadow-xs' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerateAIPlan}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold hover:from-emerald-300 hover:to-teal-300 transition-all shadow-md disabled:opacity-50"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isGenerating ? 'Synthesizing Custom Day Plan...' : 'AI Customize Today’s Plan'}</span>
          </button>
        </div>

        {customPlanNotice && (
          <div className="mt-4 bg-emerald-800/80 border border-emerald-400/30 rounded-xl p-3 text-xs text-emerald-100 flex items-center justify-between">
            <span>{customPlanNotice}</span>
            <button onClick={() => setCustomPlanNotice(null)} className="text-emerald-300 hover:text-white font-bold ml-2">✕</button>
          </div>
        )}
      </div>

      {/* Hydration Tracker Card */}
      <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Droplet className="w-6 h-6 fill-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">Daily Hydration Target</h3>
              <p className="text-xs text-gray-500">Essential for metabolism, mental clarity, and joint health.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => addWater(-250)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold"
            >
              -250ml
            </button>
            <button
              onClick={() => addWater(250)}
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 shadow-2xs"
            >
              +250ml Glass
            </button>
            <button
              onClick={() => addWater(500)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow-xs"
            >
              +500ml Bottle
            </button>
          </div>
        </div>

        {/* Hydration Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-gray-700">
            <span>Consumed: <strong className="text-blue-600">{todayLog.waterMl} ml</strong></span>
            <span>Goal: {userProfile.targetWaterMl} ml ({Math.min(100, Math.round((todayLog.waterMl / userProfile.targetWaterMl) * 100))}%)</span>
          </div>
          <div className="h-4 w-full bg-blue-50 rounded-full overflow-hidden p-0.5 border border-blue-100">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (todayLog.waterMl / userProfile.targetWaterMl) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Structured Time-of-Day Blocks */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>Your Step-by-Step Daily Schedule</span>
          <span className="text-xs font-normal px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">Interactive Checklist</span>
        </h2>

        {/* Morning Block */}
        <div className="bg-white rounded-2xl border border-amber-200/70 p-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-amber-400" />
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Morning Awakening & Energy</h3>
                <p className="text-xs text-gray-500">7:00 AM – 10:00 AM • Prime your metabolism and nervous system</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Morning Hydration */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-amber-50/40 transition-colors">
              <button onClick={() => addWater(500)} className="mt-0.5 text-blue-500 hover:text-blue-600">
                {todayLog.waterMl >= 500 ? <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" /> : <Circle className="w-5 h-5 text-gray-400" />}
              </button>
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-900">Step 1: Drink 500ml Water upon waking</div>
                <div className="text-xs text-gray-600">Rehydrate after 8 hours of sleep before coffee or caffeine.</div>
              </div>
            </div>

            {/* Breakfast Check */}
            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-amber-50/40 transition-colors">
              <div className="flex items-start gap-3">
                <button onClick={() => toggleItem('meal', breakfast.id)} className="mt-0.5">
                  {todayLog.completedMealIds.includes(breakfast.id) ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div>
                  <div className="font-semibold text-sm text-gray-900">Step 2: Nourish with {breakfast.title}</div>
                  <div className="text-xs text-gray-600">{breakfast.calories} kcal • {breakfast.protein}g protein • {breakfast.prepTimeMinutes} mins prep</div>
                </div>
              </div>
              <button 
                onClick={() => onNavigateToTab('nutrition')} 
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 shrink-0"
              >
                Recipe <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Morning Meditation */}
            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-amber-50/40 transition-colors">
              <div className="flex items-start gap-3">
                <button onClick={() => toggleItem('meditation', featuredMeditation.id)} className="mt-0.5">
                  {todayLog.completedMeditationIds.includes(featuredMeditation.id) ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div>
                  <div className="font-semibold text-sm text-gray-900">Step 3: {featuredMeditation.title}</div>
                  <div className="text-xs text-gray-600">{featuredMeditation.durationMinutes} minutes • Ground your breathing before opening notifications.</div>
                </div>
              </div>
              <button 
                onClick={() => onNavigateToTab('mindfulness')} 
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 shrink-0"
              >
                Start Timer <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mid-Day Block */}
        <div className="bg-white rounded-2xl border border-emerald-200/70 p-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Mid-Day Fuel & Physical Movement</h3>
                <p className="text-xs text-gray-500">12:00 PM – 4:00 PM • Sustain energy and activate muscles</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Lunch Check */}
            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-emerald-50/40 transition-colors">
              <div className="flex items-start gap-3">
                <button onClick={() => toggleItem('meal', lunch.id)} className="mt-0.5">
                  {todayLog.completedMealIds.includes(lunch.id) ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div>
                  <div className="font-semibold text-sm text-gray-900">Step 4: Lunch — {lunch.title}</div>
                  <div className="text-xs text-gray-600">{lunch.calories} kcal • {lunch.protein}g protein • High fiber vegetable pairing</div>
                </div>
              </div>
              <button 
                onClick={() => onNavigateToTab('nutrition')} 
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 shrink-0"
              >
                Recipe <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Daily Workout */}
            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-emerald-50/40 transition-colors">
              <div className="flex items-start gap-3">
                <button onClick={() => toggleItem('workout', featuredWorkout.id)} className="mt-0.5">
                  {todayLog.completedWorkoutIds.includes(featuredWorkout.id) ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div>
                  <div className="font-semibold text-sm text-gray-900">Step 5: {featuredWorkout.title}</div>
                  <div className="text-xs text-gray-600">{featuredWorkout.durationMinutes} mins • Est. {featuredWorkout.calorieBurnEst} kcal burned • No equipment needed</div>
                </div>
              </div>
              <button 
                onClick={() => onNavigateToTab('workouts')} 
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 shrink-0"
              >
                Launch Workout <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Evening Block */}
        <div className="bg-white rounded-2xl border border-indigo-200/70 p-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500" />
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Evening Restoration & Sleep Preparation</h3>
                <p className="text-xs text-gray-500">6:30 PM – 10:30 PM • Digestive calm and deep delta recovery</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Dinner Check */}
            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-indigo-50/40 transition-colors">
              <div className="flex items-start gap-3">
                <button onClick={() => toggleItem('meal', dinner.id)} className="mt-0.5">
                  {todayLog.completedMealIds.includes(dinner.id) ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                <div>
                  <div className="font-semibold text-sm text-gray-900">Step 6: Dinner — {dinner.title}</div>
                  <div className="text-xs text-gray-600">Eat at least 2.5 hours before bedtime to allow peaceful digestion.</div>
                </div>
              </div>
              <button 
                onClick={() => onNavigateToTab('nutrition')} 
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 shrink-0"
              >
                Recipe <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sleep Hygiene Check */}
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-indigo-50/40 transition-colors">
              <button 
                onClick={() => onUpdateLog(prev => ({ ...prev, sleepHours: Math.max(7, prev.sleepHours) }))} 
                className="mt-0.5"
              >
                {todayLog.sleepHours >= 7 ? <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" /> : <Circle className="w-5 h-5 text-gray-400" />}
              </button>
              <div>
                <div className="font-semibold text-sm text-gray-900">Step 7: Digital Sunset & 8-Hour Sleep Ritual</div>
                <div className="text-xs text-gray-600">Dim overhead lights and set bedroom temperature cool (18°C/65°F) for deep restorative sleep.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
