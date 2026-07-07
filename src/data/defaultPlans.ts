import { 
  UserProfile, 
  MealPlanItem, 
  WorkoutRoutine, 
  MeditationSession, 
  DailyLog 
} from '../types';

export const initialProfile: UserProfile = {
  name: 'Alex Rivera',
  goal: 'longevity_energy',
  diet: 'mediterranean',
  activityLevel: 'moderate',
  targetCalories: 2150,
  targetWaterMl: 2500,
  targetSleepHours: 8,
  streakDays: 14,
  soundEnabled: true,
  remindersEnabled: true,
};

export const defaultMeals: MealPlanItem[] = [
  {
    id: 'm1',
    mealType: 'breakfast',
    title: 'Sunny Avocado & Poached Egg Protein Toast',
    description: 'Crispy seeded artisanal sourdough layered with smashed avocado, soft poached pasture eggs, and hemp seeds for sustained energy.',
    calories: 460,
    protein: 24,
    carbs: 38,
    fat: 24,
    prepTimeMinutes: 12,
    ingredients: [
      '2 whole pasture eggs',
      '2 slices seeded sourdough bread',
      '1/2 ripe avocado',
      '1 tbsp hemp hearts or chia seeds',
      'Handful microgreens or baby arugula',
      '1 tsp extra virgin olive oil & sea salt'
    ],
    recipeSteps: [
      'Toast sourdough slices until crisp and golden brown.',
      'Bring a small saucepan of water with 1 tbsp vinegar to a gentle simmer and poach eggs for 3.5 minutes.',
      'Mash ripe avocado with a squeeze of fresh lemon juice, sea salt, and cracked pepper.',
      'Spread mashed avocado generously on toast, top with poached eggs, microgreens, and hemp hearts.'
    ],
    tags: ['High Protein', 'Healthy Fats', 'Quick Prep']
  },
  {
    id: 'm2',
    mealType: 'breakfast',
    title: 'Super Berry Antioxidant Greek Yogurt Bowl',
    description: 'Thick organic Greek yogurt swirled with wild blueberries, toasted walnuts, and raw wildflower honey.',
    calories: 390,
    protein: 28,
    carbs: 42,
    fat: 12,
    prepTimeMinutes: 5,
    ingredients: [
      '1.5 cups plain 2% Greek yogurt',
      '3/4 cup fresh or thawed wild blueberries',
      '30g toasted walnut halves',
      '1 tsp raw wildflower honey',
      '1 tbsp flaxseed meal'
    ],
    recipeSteps: [
      'Spoon chilled Greek yogurt into a wide serving bowl.',
      'Scatter wild berries and toasted walnuts evenly over top.',
      'Drizzle raw honey and sprinkle ground flaxseed meal for omega-3 brain nourishment.'
    ],
    tags: ['No Cook', 'Probiotics', 'Brain Fuel']
  },
  {
    id: 'm3',
    mealType: 'lunch',
    title: 'Mediterranean Quinoa & Grilled Salmon Power Bowl',
    description: 'Fluffy herb quinoa topped with warm lemon-garlic wild salmon, cucumber kalamata salad, and creamy tahini drizzle.',
    calories: 620,
    protein: 42,
    carbs: 54,
    fat: 26,
    prepTimeMinutes: 20,
    ingredients: [
      '150g wild salmon fillet (or crispy tempeh)',
      '1 cup cooked tricolor quinoa',
      '1/2 English cucumber, diced',
      '8 kalamata olives, pitted',
      '1/2 cup cherry tomatoes, halved',
      '2 tbsp tahini dressing & lemon juice'
    ],
    recipeSteps: [
      'Pan-sear seasoned salmon fillet in 1 tsp olive oil for 4 minutes per side until flaky.',
      'Layer warm cooked quinoa into a deep bowl.',
      'Arrange crisp diced cucumber, cherry tomatoes, and olives around the quinoa.',
      'Place grilled salmon in center and drizzle with creamy lemon tahini sauce.'
    ],
    tags: ['Omega-3 Boost', 'Gluten Free', 'Longevity']
  },
  {
    id: 'm4',
    mealType: 'lunch',
    title: 'Zesty Chickpea & Roasted Vegetable Tahini Wrap',
    description: 'Warm whole-grain flatbread stuffed with spiced roasted chickpeas, roasted red peppers, spinach, and garlic hummus.',
    calories: 520,
    protein: 20,
    carbs: 68,
    fat: 18,
    prepTimeMinutes: 15,
    ingredients: [
      '1 large whole grain wrap or pita',
      '3/4 cup spiced roasted chickpeas',
      '1/2 cup roasted bell peppers & zucchini',
      'Large handful fresh baby spinach',
      '3 tbsp garlic hummus'
    ],
    recipeSteps: [
      'Warm the whole grain wrap on a dry skillet for 20 seconds to soften.',
      'Spread garlic hummus evenly across the center of the wrap.',
      'Layer baby spinach, spiced chickpeas, and roasted vegetables.',
      'Roll tightly into a burly wrap and slice diagonally.'
    ],
    tags: ['Plant Based', 'High Fiber', 'On the Go']
  },
  {
    id: 'm5',
    mealType: 'dinner',
    title: 'Herb Roasted Chicken Breast with Sweet Potato Mash & Asparagus',
    description: 'Tender garlic-rosemary chicken served with velvety sweet potato mash and charred tender asparagus spears.',
    calories: 580,
    protein: 48,
    carbs: 46,
    fat: 20,
    prepTimeMinutes: 28,
    ingredients: [
      '180g free-range chicken breast fillet',
      '1 medium sweet potato, peeled and cubed',
      '1 bunch fresh green asparagus',
      '1 clove minced garlic & fresh rosemary',
      '1 tbsp extra virgin olive oil'
    ],
    recipeSteps: [
      'Steam or boil cubed sweet potato for 15 mins, then mash with a touch of olive oil and sea salt.',
      'Season chicken breast with garlic, rosemary, salt, and pepper.',
      'Pan-roast chicken and asparagus in skillet over medium-high heat for 6-7 mins per side until golden and cooked through.',
      'Serve chicken sliced over warm sweet potato mash alongside crisp asparagus spears.'
    ],
    tags: ['Lean Muscle', 'High Protein', 'Comfort Food']
  },
  {
    id: 'm6',
    mealType: 'snack',
    title: 'Almond Butter Apple Crisps & Dark Chocolate Squares',
    description: 'Crisp Fuji apple slices dipped in creamy stone-ground almond butter with 85% cacao squares.',
    calories: 240,
    protein: 6,
    carbs: 28,
    fat: 14,
    prepTimeMinutes: 3,
    ingredients: [
      '1 medium crisp Fuji or Honeycrisp apple',
      '1.5 tbsp creamy almond butter',
      '2 squares 85% organic dark chocolate'
    ],
    recipeSteps: [
      'Core and slice apple into wedges.',
      'Serve alongside stone-ground almond butter and rich dark chocolate squares for afternoon focus.'
    ],
    tags: ['Antioxidants', 'Low Sugar', 'Afternoon Energy']
  }
];

export const defaultWorkouts: WorkoutRoutine[] = [
  {
    id: 'w1',
    category: 'strength',
    title: '25-Min Home Functional Bodyweight Strength',
    durationMinutes: 25,
    difficulty: 'intermediate',
    description: 'Build full-body muscular stability, core strength, and healthy joint mobility without needing any gym equipment.',
    calorieBurnEst: 230,
    equipmentNeeded: ['Exercise Mat', 'No Equipment'],
    exercises: [
      {
        name: 'Dynamic World’s Greatest Stretch',
        setsOrTime: '6 reps per side',
        restSeconds: 30,
        tips: 'Step into a deep lunge, rotate chest toward front knee, and open your arm toward the ceiling.',
        targetMuscle: 'Hips & Thoracic Spine'
      },
      {
        name: 'Slow-Tempo Bodyweight Squats',
        setsOrTime: '3 sets of 15 reps',
        restSeconds: 45,
        tips: 'Lower down for 3 slow seconds, pause at parallel, then drive up through your heels.',
        targetMuscle: 'Quads & Glutes'
      },
      {
        name: 'Scapular & Standard Push-Ups',
        setsOrTime: '3 sets of 10-12 reps',
        restSeconds: 45,
        tips: 'Keep core braced tight like a plank. Drop to knees if form breaks.',
        targetMuscle: 'Chest, Shoulders & Triceps'
      },
      {
        name: 'Alternating Reverse Lunges',
        setsOrTime: '3 sets of 12 reps/side',
        restSeconds: 45,
        tips: 'Maintain 90-degree bend in front knee and keep torso upright.',
        targetMuscle: 'Hamstrings & Balance'
      },
      {
        name: 'Hollow Body Core Hold',
        setsOrTime: '3 sets of 35 seconds',
        restSeconds: 30,
        tips: 'Press your lower back firmly into the mat. Extend legs only as far as back stays grounded.',
        targetMuscle: 'Deep Abdominals'
      }
    ]
  },
  {
    id: 'w2',
    category: 'mobility_posture',
    title: '10-Min Ergonomic Desk Posture & Spine Reset',
    durationMinutes: 10,
    difficulty: 'beginner',
    description: 'Relieve neck tension, tight hip flexors, and rounded shoulder slouching caused by sitting at a desk or computer.',
    calorieBurnEst: 65,
    equipmentNeeded: ['Chair or Standing Desk Space'],
    exercises: [
      {
        name: 'Chin Tucks & Neck Decompression',
        setsOrTime: '2 sets of 10 slow holds',
        restSeconds: 15,
        tips: 'Gently glide your chin straight back as if making a double chin. Hold for 3 seconds.',
        targetMuscle: 'Upper Cervical Spine'
      },
      {
        name: 'Doorway Chest & Anterior Shoulder Stretch',
        setsOrTime: '2 sets of 45 seconds',
        restSeconds: 15,
        tips: 'Place forearms on doorframe and lean chest forward until you feel a gentle release across collarbones.',
        targetMuscle: 'Pecs & Anterior Deltoid'
      },
      {
        name: 'Seated Spinal Twist & Cat-Cow',
        setsOrTime: '10 slow breathing cycles',
        restSeconds: 20,
        tips: 'Inhale arching back gently, exhale rounding spine while tucking chin.',
        targetMuscle: 'Spinal Erectors'
      },
      {
        name: 'Standing Hip Flexor Lunge Stretch',
        setsOrTime: '45 seconds per leg',
        restSeconds: 15,
        tips: 'Squeeze back glute firmly to tilt pelvis backward and unlock tight hip flexors.',
        targetMuscle: 'Psoas & Hips'
      }
    ]
  },
  {
    id: 'w3',
    category: 'cardio_hiit',
    title: '18-Min Metabolic Energy & Heart Health intervals',
    durationMinutes: 18,
    difficulty: 'intermediate',
    description: 'Invigorating low-impact interval cardio designed to boost cardiovascular endurance and elevate endorphins.',
    calorieBurnEst: 210,
    equipmentNeeded: ['No Equipment'],
    exercises: [
      {
        name: 'Light Jog in Place & Arm Circles',
        setsOrTime: '2 minutes warmup',
        restSeconds: 30,
        tips: 'Breathe rhythmically through nose and loosen shoulders.',
        targetMuscle: 'Cardio Warmup'
      },
      {
        name: 'Low-Impact Mountain Climbers',
        setsOrTime: '4 rounds of 40 sec work / 20 sec rest',
        restSeconds: 20,
        tips: 'Drive knees smoothly toward chest while maintaining a strong plank shoulder position.',
        targetMuscle: 'Core & Endurance'
      },
      {
        name: 'Speed Skater Lateral Bounds',
        setsOrTime: '4 rounds of 40 sec work / 20 sec rest',
        restSeconds: 20,
        tips: 'Step or bound side to side softly, absorbing landing with knee.',
        targetMuscle: 'Glutes & Lateral Agility'
      },
      {
        name: 'Shadow Boxing Jab-Cross Combos',
        setsOrTime: '3 rounds of 60 seconds',
        restSeconds: 30,
        tips: 'Rotate hips with each punch and keep core tight.',
        targetMuscle: 'Upper Body Cardio'
      }
    ]
  }
];

export const defaultMeditations: MeditationSession[] = [
  {
    id: 'med1',
    title: '5-Min Box Breathing for Nervous System Calm',
    category: 'box_breathing',
    durationMinutes: 5,
    description: 'Used by navy seals and peak performers to rapidly lower cortisol, stabilize heart rate variability (HRV), and center mind focus.',
    techniqueSteps: [
      'Inhale slowly and deeply through your nose for a count of 4.',
      'Hold your breath gently at the top for a count of 4.',
      'Exhale completely through your mouth for a count of 4.',
      'Hold the empty breath peacefully at the bottom for a count of 4.',
      'Repeat this rhythmic square breath cycle until inner calm washes over.'
    ],
    soundscape: 'rain'
  },
  {
    id: 'med2',
    title: '8-Min Morning Intention & Energy Soundscape',
    category: 'focus_morning',
    durationMinutes: 8,
    description: 'Awaken with clarity and gratitude. Align your mental focus before checking emails or starting your daily tasks.',
    techniqueSteps: [
      'Sit comfortably upright with an open posture and hands resting in your lap.',
      'Take 3 deep cleansing breaths, feeling cool air enter and warm air release.',
      'Bring to mind 2 simple things you feel genuinely grateful for right now.',
      'Set one clear, positive intention for how you want to carry yourself today.',
      'Let the harmonic Tibetan singing bowls anchor your presence.'
    ],
    soundscape: 'bowls'
  },
  {
    id: 'med3',
    title: '10-Min Evening 4-7-8 Deep Sleep Wind-Down',
    category: 'sleep_winddown',
    durationMinutes: 10,
    description: 'Transition your brainwaves from beta activity into restful delta sleep using soothing ocean wave rhythm and Dr. Weil’s 4-7-8 breath.',
    techniqueSteps: [
      'Lie down comfortably in bed with dim lights and close your eyes.',
      'Inhale quietly through your nose for 4 seconds.',
      'Hold your breath comfortably for 7 seconds.',
      'Exhale audibly through your mouth making a gentle "whoosh" sound for 8 seconds.',
      'Allow each wave of exhalation to melt heavy tension from your forehead, jaw, shoulders, and legs.'
    ],
    soundscape: 'waves'
  }
];

export const mockHistoricalLogs: DailyLog[] = [
  {
    dateString: '2026-06-26',
    waterMl: 2300,
    sleepHours: 7.5,
    moodScore: 4,
    energyScore: 4,
    completedMealIds: ['m1', 'm3', 'm5'],
    completedWorkoutIds: ['w1'],
    completedMeditationIds: ['med1']
  },
  {
    dateString: '2026-06-27',
    waterMl: 2600,
    sleepHours: 8.0,
    moodScore: 5,
    energyScore: 5,
    completedMealIds: ['m2', 'm4', 'm5'],
    completedWorkoutIds: ['w2'],
    completedMeditationIds: ['med2']
  },
  {
    dateString: '2026-06-28',
    waterMl: 2100,
    sleepHours: 6.8,
    moodScore: 3,
    energyScore: 3,
    completedMealIds: ['m1', 'm3'],
    completedWorkoutIds: [],
    completedMeditationIds: ['med3']
  },
  {
    dateString: '2026-06-29',
    waterMl: 2500,
    sleepHours: 7.8,
    moodScore: 4,
    energyScore: 4,
    completedMealIds: ['m1', 'm3', 'm5', 'm6'],
    completedWorkoutIds: ['w3'],
    completedMeditationIds: ['med1']
  },
  {
    dateString: '2026-06-30',
    waterMl: 2700,
    sleepHours: 8.2,
    moodScore: 5,
    energyScore: 5,
    completedMealIds: ['m2', 'm3', 'm5'],
    completedWorkoutIds: ['w1'],
    completedMeditationIds: ['med2']
  },
  {
    dateString: '2026-07-01',
    waterMl: 2450,
    sleepHours: 7.6,
    moodScore: 4,
    energyScore: 4,
    completedMealIds: ['m1', 'm4', 'm5'],
    completedWorkoutIds: ['w2'],
    completedMeditationIds: ['med1', 'med3']
  },
  {
    dateString: '2026-07-02', // Today
    waterMl: 1750,
    sleepHours: 7.9,
    moodScore: 5,
    energyScore: 4,
    completedMealIds: ['m1', 'm3'],
    completedWorkoutIds: ['w2'],
    completedMeditationIds: ['med1']
  }
];
