import React, { useState } from 'react';
import { X, Settings, Check, RefreshCw, Award, Heart } from 'lucide-react';
import { UserProfile, HealthGoal, DietPreference, ActivityLevel } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdateProfile: (newProfile: UserProfile) => void;
  onResetData: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onUpdateProfile,
  onResetData
}) => {
  const [name, setName] = useState(userProfile.name);
  const [goal, setGoal] = useState<HealthGoal>(userProfile.goal);
  const [diet, setDiet] = useState<DietPreference>(userProfile.diet);
  const [activity, setActivity] = useState<ActivityLevel>(userProfile.activityLevel);
  const [water, setWater] = useState(userProfile.targetWaterMl);
  const [calories, setCalories] = useState(userProfile.targetCalories);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...userProfile,
      name: name.trim() || 'Alex Rivera',
      goal,
      diet,
      activityLevel: activity,
      targetWaterMl: Number(water) || 2500,
      targetCalories: Number(calories) || 2000
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Personalize Your Health Profile</h2>
              <p className="text-xs text-gray-500">Adjust goals, diet preferences, and daily targets</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-gray-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              required
            />
          </div>

          {/* Primary Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Primary Health Focus</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'longevity_energy', label: 'Longevity & Energy', desc: 'Cellular health & stamina' },
                { id: 'weight_loss', label: 'Metabolic Fat Loss', desc: 'Healthy calorie balance' },
                { id: 'muscle_gain', label: 'Muscle & Strength', desc: 'Protein synthesis & recovery' },
                { id: 'stress_reduction', label: 'Stress Reduction', desc: 'Nervous system balance' },
                { id: 'balanced_vitality', label: 'Balanced Vitality', desc: 'Everyday holistic wellness' }
              ].map(g => (
                <div
                  key={g.id}
                  onClick={() => setGoal(g.id as HealthGoal)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    goal === g.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-2xs font-semibold'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-bold">{g.label}</div>
                  <div className="text-[11px] text-gray-500">{g.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dietary Preference */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Dietary Style</label>
            <div className="flex flex-wrap gap-2">
              {(['omnivore', 'mediterranean', 'vegetarian', 'vegan', 'keto_lowcarb'] as const).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDiet(d)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    diet === d
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {d.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Targets Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Daily Water Target (ml)</label>
              <input
                type="number"
                value={water}
                onChange={(e) => setWater(Number(e.target.value))}
                step={250}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Daily Calorie Target (kcal)</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                step={50}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all sample progress and logs?')) {
                  onResetData();
                  onClose();
                }
              }}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Sample Data</span>
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
