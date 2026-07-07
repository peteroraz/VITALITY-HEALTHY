import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  BarChart3, 
  Award, 
  Flame, 
  Droplet, 
  Moon, 
  Smile, 
  TrendingUp, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { DailyLog, UserProfile } from '../types';

interface ScorecardViewProps {
  logs: DailyLog[];
  userProfile: UserProfile;
}

export const ScorecardView: React.FC<ScorecardViewProps> = ({ logs, userProfile }) => {
  // Format logs for charts
  const chartData = logs.map((log) => {
    const dateObj = new Date(log.dateString);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    const mealsDone = log.completedMealIds.length;
    const workoutsDone = log.completedWorkoutIds.length;
    const meditationsDone = log.completedMeditationIds.length;
    const totalHabits = mealsDone + workoutsDone + meditationsDone;

    return {
      day: dayName,
      date: log.dateString,
      waterMl: log.waterMl,
      waterTarget: userProfile.targetWaterMl,
      sleepHours: log.sleepHours,
      moodScore: log.moodScore * 20, // scale to 100 for comparison
      energyScore: log.energyScore * 20,
      totalHabits,
      mealsDone,
      workoutsDone,
      meditationsDone
    };
  });

  // Averages
  const avgWater = Math.round(logs.reduce((sum, l) => sum + l.waterMl, 0) / logs.length || 0);
  const avgSleep = (logs.reduce((sum, l) => sum + l.sleepHours, 0) / logs.length || 0).toFixed(1);
  const avgHabits = (logs.reduce((sum, l) => sum + (l.completedMealIds.length + l.completedWorkoutIds.length + l.completedMeditationIds.length), 0) / logs.length || 0).toFixed(1);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-emerald-600" />
            <span>Vitality Scorecard & Habit Trends</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Analyze your daily compound habits across hydration, sleep restoration, nutrition adherence, and movement.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-4 py-2 rounded-2xl font-bold text-sm border border-emerald-200/60 self-start md:self-auto">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Overall Consistency: Excellent</span>
        </div>
      </div>

      {/* Top Stat Overview Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Active Streak</span>
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{userProfile.streakDays} Days</div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Keep the momentum going!
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Avg Hydration</span>
            <Droplet className="w-5 h-5 text-blue-500 fill-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{avgWater} ml</div>
          <div className="text-xs text-gray-500">Target: {userProfile.targetWaterMl} ml/day</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Avg Sleep</span>
            <Moon className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{avgSleep} hrs</div>
          <div className="text-xs text-emerald-600 font-semibold">Optimal restorative range</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Daily Habits</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gray-900">{avgHabits} / day</div>
          <div className="text-xs text-gray-500">Meals, workouts & calm</div>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hydration vs Goal Chart */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Daily Hydration vs Target (ml)</h3>
              <p className="text-xs text-gray-500">Comparing daily water intake against your personalized goal</p>
            </div>
            <Droplet className="w-5 h-5 text-blue-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value} ml`, 'Water']}
                />
                <Legend />
                <Bar dataKey="waterMl" name="Water Consumed" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="waterTarget" name="Target Goal" fill="#dbeafe" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sleep Duration Trend */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Restorative Sleep Trend (Hours)</h3>
              <p className="text-xs text-gray-500">Tracking nightly sleep hours for nervous system recovery</p>
            </div>
            <Moon className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSleep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis domain={[5, 10]} axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`${value} hrs`, 'Sleep']}
                />
                <Area type="monotone" dataKey="sleepHours" name="Sleep Hours" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSleep)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weekly Habit Completion Matrix */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>7-Day Habit Scorecard</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">Visualizing your daily completion across nutrition, workouts, and mindfulness.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {logs.map((log, idx) => {
            const dateObj = new Date(log.dateString);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const isToday = idx === logs.length - 1;

            return (
              <div 
                key={log.dateString}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-between gap-3 text-center transition-all ${
                  isToday 
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-xs' 
                    : 'border-gray-200/80 bg-white'
                }`}
              >
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {isToday ? 'Today' : dayName}
                  </div>
                  <div className="text-xs font-semibold text-gray-400 mt-0.5">
                    {log.dateString.slice(5)}
                  </div>
                </div>

                {/* Badges */}
                <div className="space-y-1.5 w-full">
                  <div className={`text-[11px] px-2 py-1 rounded-lg font-medium flex items-center justify-between ${
                    log.completedMealIds.length >= 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span>🥗 Meals</span>
                    <span>{log.completedMealIds.length}</span>
                  </div>
                  <div className={`text-[11px] px-2 py-1 rounded-lg font-medium flex items-center justify-between ${
                    log.completedWorkoutIds.length >= 1 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span>💪 Workout</span>
                    <span>{log.completedWorkoutIds.length ? '✓' : '—'}</span>
                  </div>
                  <div className={`text-[11px] px-2 py-1 rounded-lg font-medium flex items-center justify-between ${
                    log.completedMeditationIds.length >= 1 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-500'
                  }`}>
                    <span>🧘 Calm</span>
                    <span>{log.completedMeditationIds.length ? '✓' : '—'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
