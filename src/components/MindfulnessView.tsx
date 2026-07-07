import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Play, 
  Pause, 
  CheckCircle2, 
  Circle, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Moon, 
  Sun, 
  Smile, 
  Meh, 
  Frown,
  Award,
  Wind
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MeditationSession, UserProfile, DailyLog } from '../types';
import { sound } from '../utils/soundGenerator';

interface MindfulnessViewProps {
  meditations: MeditationSession[];
  completedMeditationIds: string[];
  onToggleMeditation: (id: string) => void;
  userProfile: UserProfile;
  todayLog: DailyLog;
  onUpdateLog: (updater: (prev: DailyLog) => DailyLog) => void;
}

export const MindfulnessView: React.FC<MindfulnessViewProps> = ({
  meditations,
  completedMeditationIds,
  onToggleMeditation,
  userProfile,
  todayLog,
  onUpdateLog
}) => {
  const [activeSoundscape, setActiveSoundscape] = useState<'rain' | 'waves' | 'bowls' | 'silent'>('silent');
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [breathCount, setBreathCount] = useState(4);
  const [sessionMinutesElapsed, setSessionMinutesElapsed] = useState(0);

  // Box breathing pacing cycle (4s inhale -> 4s hold -> 4s exhale -> 4s hold)
  useEffect(() => {
    let timer: any = null;
    if (isBreathingActive) {
      timer = setInterval(() => {
        setBreathCount(prev => {
          if (prev <= 1) {
            setBreathPhase(currentPhase => {
              if (currentPhase === 'inhale') return 'hold1';
              if (currentPhase === 'hold1') return 'exhale';
              if (currentPhase === 'exhale') return 'hold2';
              return 'inhale';
            });
            if (userProfile.soundEnabled) sound.playChime(528, 'bell');
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBreathingActive, userProfile.soundEnabled]);

  const toggleSoundscape = (s: 'rain' | 'waves' | 'bowls' | 'silent') => {
    if (activeSoundscape === s || s === 'silent') {
      sound.stopAmbient();
      setActiveSoundscape('silent');
    } else {
      sound.startAmbient(s);
      setActiveSoundscape(s);
    }
  };

  useEffect(() => {
    return () => {
      sound.stopAmbient();
    };
  }, []);

  const handleUpdateMood = (score: number) => {
    onUpdateLog(prev => ({ ...prev, moodScore: score }));
  };

  const handleUpdateEnergy = (score: number) => {
    onUpdateLog(prev => ({ ...prev, energyScore: score }));
  };

  const phaseInstructions = {
    inhale: 'Breathe slowly in through your nose...',
    hold1: 'Hold your breath gently...',
    exhale: 'Exhale smoothly through your mouth...',
    hold2: 'Rest peacefully at the bottom...'
  };

  const circleScale = {
    inhale: 'scale-125 bg-emerald-500/30 border-emerald-400',
    hold1: 'scale-125 bg-teal-500/40 border-teal-300',
    exhale: 'scale-90 bg-indigo-500/20 border-indigo-400',
    hold2: 'scale-90 bg-slate-500/20 border-slate-400'
  }[breathPhase];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="w-7 h-7 text-emerald-600" />
            <span>Mindful Meditation & Mental Calm</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Lower daily cortisol, restore emotional equilibrium, and improve sleep depth through intentional breath.
          </p>
        </div>

        {/* Soundscape Selector */}
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200/60 self-start md:self-auto">
          <span className="text-xs font-semibold text-gray-500 pl-2">Ambient Audio:</span>
          {(['rain', 'waves', 'bowls'] as const).map(s => (
            <button
              key={s}
              onClick={() => toggleSoundscape(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all flex items-center gap-1.5 ${
                activeSoundscape === s
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/60'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{s === 'bowls' ? 'Tibetan Bowls' : s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Box Breathing Centerpiece */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="space-y-2 max-w-lg relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
            <Wind className="w-3.5 h-3.5" />
            <span>Navy Seal 4-4-4-4 Box Breathing Cycle</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">Center Your Mind & Heart Rate</h2>
          <p className="text-xs sm:text-sm text-emerald-100/80">
            Follow the expanding and contracting circle below. Allow your shoulders to relax completely.
          </p>
        </div>

        {/* Breathing Circle Visualizer */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4">
          {/* Animated Background Pulse Ring */}
          <div className={`absolute w-full h-full rounded-full border-2 transition-all duration-[4000ms] ease-in-out ${circleScale}`} />
          <div className={`absolute w-3/4 h-3/4 rounded-full border transition-all duration-[4000ms] ease-in-out ${circleScale} opacity-50`} />

          {/* Center Info */}
          <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center space-y-1">
            <span className="text-4xl sm:text-5xl font-mono font-extrabold tracking-tight text-white">
              {isBreathingActive ? breathCount : '4s'}
            </span>
            <span className="text-sm sm:text-base font-bold uppercase tracking-wider text-emerald-300">
              {isBreathingActive ? breathPhase.replace(/\d/, '') : 'Ready'}
            </span>
            <span className="text-xs text-emerald-100/70 max-w-[160px] pt-1">
              {isBreathingActive ? phaseInstructions[breathPhase] : 'Press start to begin breath cycle'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => {
              setIsBreathingActive(!isBreathingActive);
              if (!isBreathingActive) {
                setBreathPhase('inhale');
                setBreathCount(4);
              }
            }}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-lg transition-all ${
              isBreathingActive 
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400' 
                : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 hover:from-emerald-300 hover:to-teal-300'
            }`}
          >
            {isBreathingActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-slate-950" />}
            <span>{isBreathingActive ? 'Pause Breathing Cycle' : 'Start Box Breathing Session'}</span>
          </button>
        </div>
      </div>

      {/* Daily Grounding Check-in */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mood Check-in */}
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base">How calm and centered do you feel right now?</h3>
            <p className="text-xs text-gray-500">Regular self-checks build emotional resilience.</p>
          </div>
          <div className="flex items-center justify-between gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
            {[
              { score: 1, label: 'Stressed', icon: '😫' },
              { score: 2, label: 'Tense', icon: '😕' },
              { score: 3, label: 'Neutral', icon: '😐' },
              { score: 4, label: 'Grounding', icon: '🙂' },
              { score: 5, label: 'Peaceful', icon: '😌' }
            ].map(item => (
              <button
                key={item.score}
                onClick={() => handleUpdateMood(item.score)}
                className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  todayLog.moodScore === item.score
                    ? 'bg-emerald-600 text-white shadow-sm font-bold scale-105'
                    : 'hover:bg-gray-200/60 text-gray-700'
                }`}
              >
                <span className="text-xl sm:text-2xl">{item.icon}</span>
                <span className="text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Energy Check-in */}
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-gray-900 text-base">How is your daily physical energy level?</h3>
            <p className="text-xs text-gray-500">Tracks how well your sleep and nutrition are fueling your day.</p>
          </div>
          <div className="flex items-center justify-between gap-2 bg-gray-50 p-3 rounded-2xl border border-gray-100">
            {[
              { score: 1, label: 'Exhausted', icon: '🪫' },
              { score: 2, label: 'Sluggish', icon: '🥱' },
              { score: 3, label: 'Steady', icon: '⚡' },
              { score: 4, label: 'Vibrant', icon: '🌟' },
              { score: 5, label: 'Peak Fuel', icon: '🚀' }
            ].map(item => (
              <button
                key={item.score}
                onClick={() => handleUpdateEnergy(item.score)}
                className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${
                  todayLog.energyScore === item.score
                    ? 'bg-teal-600 text-white shadow-sm font-bold scale-105'
                    : 'hover:bg-gray-200/60 text-gray-700'
                }`}
              >
                <span className="text-xl sm:text-2xl">{item.icon}</span>
                <span className="text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guided Meditation Routines List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Guided Daily Meditation Library</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {meditations.map((med) => {
            const isCompleted = completedMeditationIds.includes(med.id);
            return (
              <div
                key={med.id}
                className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all shadow-sm ${
                  isCompleted ? 'border-emerald-300 bg-emerald-50/20' : 'border-gray-200 hover:border-emerald-200'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800">
                      {med.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">⏱️ {med.durationMinutes}m</span>
                  </div>

                  <h3 className={`font-bold text-lg text-gray-900 ${isCompleted ? 'line-through text-gray-600' : ''}`}>
                    {med.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {med.description}
                  </p>

                  <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 border border-gray-100">
                    <div className="text-[10px] font-bold uppercase text-gray-500">Technique Guide</div>
                    <ol className="space-y-1">
                      {med.techniqueSteps.slice(0, 3).map((step, idx) => (
                        <li key={idx} className="text-xs text-gray-700 leading-normal">
                          <strong className="text-emerald-700">{idx + 1}.</strong> {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => toggleSoundscape(med.soundscape === 'bowls' ? 'bowls' : med.soundscape === 'rain' ? 'rain' : 'waves')}
                    className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Play {med.soundscape} sound</span>
                  </button>

                  <button
                    onClick={() => {
                      onToggleMeditation(med.id);
                      try {
                        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
                      } catch (e) {}
                    }}
                    className={`p-2 rounded-xl border transition-colors ${
                      isCompleted ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-100 text-gray-400 hover:text-emerald-600'
                    }`}
                    title={isCompleted ? 'Session completed' : 'Mark completed'}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
