import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Clock, 
  Flame, 
  Play, 
  Pause, 
  CheckCircle2, 
  Circle, 
  X, 
  Volume2, 
  RotateCcw, 
  Award, 
  ChevronRight,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkoutRoutine, Exercise, UserProfile } from '../types';
import { sound } from '../utils/soundGenerator';

interface WorkoutsViewProps {
  workouts: WorkoutRoutine[];
  completedWorkoutIds: string[];
  onToggleWorkout: (id: string) => void;
  userProfile: UserProfile;
}

export const WorkoutsView: React.FC<WorkoutsViewProps> = ({
  workouts,
  completedWorkoutIds,
  onToggleWorkout,
  userProfile
}) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeWorkout, setActiveWorkout] = useState<WorkoutRoutine | null>(null);

  // Active workout timer modal state
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(45);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [checkedExercises, setCheckedExercises] = useState<number[]>([]);

  const filteredWorkouts = categoryFilter === 'all' 
    ? workouts 
    : workouts.filter(w => w.category === categoryFilter);

  const startWorkoutModal = (workout: WorkoutRoutine) => {
    setActiveWorkout(workout);
    setCurrentExerciseIdx(0);
    setCheckedExercises([]);
    setTimerSeconds(45);
    setIsTimerRunning(false);
  };

  // Timer countdown hook
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev === 4 && userProfile.soundEnabled) {
            sound.playChime(440, 'beep');
          }
          if (prev <= 1) {
            setIsTimerRunning(false);
            if (userProfile.soundEnabled) sound.playChime(880, 'beep');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, userProfile.soundEnabled]);

  const toggleExerciseCheck = (idx: number) => {
    setCheckedExercises(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const completeActiveWorkout = () => {
    if (activeWorkout && !completedWorkoutIds.includes(activeWorkout.id)) {
      onToggleWorkout(activeWorkout.id);
    }
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch (e) {}
    setActiveWorkout(null);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Dumbbell className="w-7 h-7 text-emerald-600" />
            <span>Guided Workouts & Movement</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Tailored physical movement routines designed to boost functional strength, joint mobility, and posture.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Routines' },
            { id: 'strength', label: 'Functional Strength' },
            { id: 'mobility_posture', label: 'Desk Posture Reset' },
            { id: 'cardio_hiit', label: 'Metabolic Cardio' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Workouts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorkouts.map((workout) => {
          const isCompleted = completedWorkoutIds.includes(workout.id);
          const difficultyColors = {
            beginner: 'bg-green-100 text-green-800',
            intermediate: 'bg-amber-100 text-amber-800',
            advanced: 'bg-rose-100 text-rose-800'
          };

          return (
            <div
              key={workout.id}
              className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all shadow-sm ${
                isCompleted ? 'border-emerald-300 bg-emerald-50/20' : 'border-gray-200/80 hover:border-emerald-200'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${difficultyColors[workout.difficulty]}`}>
                    {workout.difficulty}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    <span>{workout.durationMinutes} mins</span>
                  </div>
                </div>

                <div>
                  <h3 className={`text-lg font-bold text-gray-900 ${isCompleted ? 'line-through text-gray-600' : ''}`}>
                    {workout.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                    {workout.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {workout.equipmentNeeded.map((eq, i) => (
                    <span key={i} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                      🛠️ {eq}
                    </span>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-2xl p-3 space-y-1.5 border border-gray-100">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Exercise Circuit ({workout.exercises.length})</div>
                  <ul className="space-y-1">
                    {workout.exercises.slice(0, 3).map((ex, idx) => (
                      <li key={idx} className="text-xs text-gray-700 flex justify-between">
                        <span className="truncate pr-2 font-medium">• {ex.name}</span>
                        <span className="text-gray-400 text-[11px] shrink-0">{ex.setsOrTime}</span>
                      </li>
                    ))}
                    {workout.exercises.length > 3 && (
                      <li className="text-[11px] text-emerald-700 font-semibold pt-0.5">+ {workout.exercises.length - 3} more exercises</li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600">
                  <Flame className="w-4 h-4 fill-amber-500" />
                  <span>~{workout.calorieBurnEst} kcal</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleWorkout(workout.id)}
                    className={`p-2 rounded-xl border transition-colors ${
                      isCompleted ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-100 text-gray-400 hover:text-emerald-600'
                    }`}
                    title={isCompleted ? 'Completed' : 'Mark completed'}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => startWorkoutModal(workout)}
                    className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Session</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Workout Session Modal Player */}
      {activeWorkout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Active Guided Session
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{activeWorkout.title}</h2>
              </div>
              <button
                onClick={() => setActiveWorkout(null)}
                className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interval Timer Widget */}
            <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">Interval Pacing Timer</div>
                <div className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-white">
                  {Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-emerald-200/80">Audio beep cues at 3 seconds remaining</div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTimerSeconds(45)}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                  title="Reset to 45s"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all ${
                    isTimerRunning ? 'bg-amber-500 text-slate-950' : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-slate-950" />}
                  <span>{isTimerRunning ? 'Pause Timer' : 'Start 45s Interval'}</span>
                </button>
              </div>
            </div>

            {/* Step-by-Step Exercises Checklist */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">
                Exercise Checklist ({checkedExercises.length} / {activeWorkout.exercises.length} completed)
              </h3>

              <div className="space-y-3">
                {activeWorkout.exercises.map((ex, idx) => {
                  const isChecked = checkedExercises.includes(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleExerciseCheck(idx)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                        isChecked 
                          ? 'bg-emerald-50/50 border-emerald-300 text-gray-500' 
                          : 'bg-white border-gray-200 hover:border-emerald-300 shadow-2xs'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 bg-gray-50'
                      }`}>
                        {isChecked && <CheckCircle2 className="w-4 h-4" />}
                      </div>

                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <span className={`font-bold text-sm sm:text-base ${isChecked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {idx + 1}. {ex.name}
                          </span>
                          <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-md">
                            {ex.setsOrTime}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          💡 <strong className="text-gray-800">Form Tip:</strong> {ex.tips}
                        </p>
                        <div className="text-[11px] text-emerald-700 font-medium">
                          🎯 Target Muscle: {ex.targetMuscle}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setActiveWorkout(null)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={completeActiveWorkout}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>Mark Routine Complete!</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
