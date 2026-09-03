export type HealthGoal = 
  | 'weight_loss' 
  | 'muscle_gain' 
  | 'longevity_energy' 
  | 'stress_reduction' 
  | 'balanced_vitality';

export type DietPreference = 
  | 'omnivore' 
  | 'vegetarian' 
  | 'vegan' 
  | 'mediterranean' 
  | 'keto_lowcarb';

export type ActivityLevel = 
  | 'sedentary' 
  | 'moderate' 
  | 'active' 
  | 'athletic';

export interface UserProfile {
  name: string;
  goal: HealthGoal;
  diet: DietPreference;
  activityLevel: ActivityLevel;
  targetCalories: number;
  targetWaterMl: number;
  targetSleepHours: number;
  streakDays: number;
  soundEnabled: boolean;
  remindersEnabled: boolean;
}

export interface IngredientItem {
  item: string;
  amount: string;
  checked?: boolean;
}

export interface MealPlanItem {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  title: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTimeMinutes: number;
  ingredients: string[];
  recipeSteps: string[];
  tags: string[];
  imageUrl?: string;
}

export interface Exercise {
  name: string;
  setsOrTime: string;
  restSeconds: number;
  tips: string;
  targetMuscle: string;
}

export interface WorkoutRoutine {
  id: string;
  category: 'strength' | 'cardio_hiit' | 'mobility_posture' | 'mindful_walk';
  title: string;
  durationMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  calorieBurnEst: number;
  exercises: Exercise[];
  equipmentNeeded: string[];
}

export interface MeditationSession {
  id: string;
  title: string;
  category: 'focus_morning' | 'stress_relief' | 'box_breathing' | 'sleep_winddown';
  durationMinutes: number;
  description: string;
  techniqueSteps: string[];
  soundscape: 'rain' | 'waves' | 'bowls' | 'silent';
}

export interface DailyLog {
  dateString: string; // YYYY-MM-DD
  waterMl: number;
  sleepHours: number;
  moodScore: number; // 1 to 5
  energyScore: number; // 1 to 5
  completedMealIds: string[];
  completedWorkoutIds: string[];
  completedMeditationIds: string[];
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  suggestedActions?: Array<{ label: string; action: string }>;
}
