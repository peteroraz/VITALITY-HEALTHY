import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;

function initializeFirebaseAdmin() {
  if (!firebaseProjectId) return null;
  if (!getApps().length) initializeApp({ projectId: firebaseProjectId });
  return getAdminAuth();
}

async function requireFirebaseUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authorization = req.header('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) return res.status(401).json({ error: 'Authentication required.' });

  const adminAuth = initializeFirebaseAdmin();
  if (!adminAuth) {
    return res.status(503).json({ error: 'Server authentication is not configured.' });
  }

  try {
    res.locals.firebaseUser = await adminAuth.verifyIdToken(match[1]);
    return next();
  } catch (error) {
    console.warn('Rejected invalid Firebase ID token:', error);
    return res.status(401).json({ error: 'Your login has expired. Please sign in again.' });
  }
}

// Initialize Google GenAI lazily or when available
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', firebaseAuthConfigured: Boolean(firebaseProjectId) });
});

// Prevent anonymous callers from consuming protected AI endpoints.
app.use('/api/ai', requireFirebaseUser);

// AI Health Coach chat endpoint
app.post('/api/ai/coach', async (req, res) => {
  try {
    const { userMessage, userProfile, chatHistory = [] } = req.body;
    const ai = getAiClient();

    if (!ai) {
      // Fallback expert advice if API key is not set
      return res.json({
        reply: `Here's a tailored tip for your **${userProfile?.goal || 'healthy living'}** goal: Prioritize hydration early in the day (aim for 500ml upon waking) and aim for 25-30g of protein per meal to keep blood sugar stable. Consistency over perfection is the true secret to daily vitality! Notice how small 1% improvements each day compound over weeks. How can I assist with your hydration or workout schedule today?`,
        suggestedActions: [
          { label: 'Suggest high-protein snack', action: 'Give me 3 quick high-protein snack ideas under 200 calories.' },
          { label: '5-min office stretch', action: 'What are 4 quick stretches I can do at my desk right now?' },
          { label: 'Improve sleep tonight', action: 'Give me a 3-step evening wind-down routine for deep sleep.' }
        ]
      });
    }

    const systemPrompt = `You are "Vitality AI", an empathetic, science-backed personal health, nutrition, fitness, and mindfulness coach.
The user's current profile:
- Goal: ${userProfile?.goal || 'Balanced healthy living'}
- Diet Preference: ${userProfile?.diet || 'Omnivore'}
- Activity Level: ${userProfile?.activityLevel || 'Moderate'}
- Target Calories: ${userProfile?.targetCalories || 2000} kcal/day

Keep your advice practical, encouraging, safe, and realistic for daily life. Do not give medical diagnoses; encourage consulting doctors for clinical issues.
Provide actionable day-to-day tips. Format your response clearly in markdown.
At the end of your response, optionally suggest 2 or 3 follow-up actions or questions the user could explore.`;

    const contents = [
      ...chatHistory.slice(-6).map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    const replyText = response.text || "I'm here to support your daily wellness journey! How can I help with your workouts or nutrition today?";
    
    res.json({
      reply: replyText,
      suggestedActions: [
        { label: 'Quick energy boost tip', action: 'How can I get an energy boost without afternoon caffeine?' },
        { label: 'Hydration check', action: 'How much water should I drink before and after a workout?' }
      ]
    });
  } catch (error: any) {
    console.error('Error in AI Coach:', error);
    res.status(500).json({ error: 'Failed to generate coaching response.' });
  }
});

// AI Daily Plan Generator endpoint
app.post('/api/ai/generate-day', async (req, res) => {
  try {
    const { goal, diet, calories, availableMinutes, stressLevel } = req.body;
    const ai = getAiClient();

    if (!ai) {
      // Return high quality offline fallback customized plan
      return res.json({
        plan: {
          title: `Custom ${goal ? goal.replace('_', ' ') : 'Vitality'} Day Plan`,
          summary: `Crafted specifically for your ${diet || 'balanced'} nutrition style and ${availableMinutes || 30}-minute exercise window.`,
          meals: [
            {
              mealType: 'breakfast',
              title: 'Avocado & Scrambled Egg Power Toast',
              calories: Math.round(calories * 0.25 || 480),
              protein: 24,
              carbs: 35,
              fat: 26,
              prepTimeMinutes: 10,
              ingredients: ['2 whole eggs', '1 slice seeded sourdough', '1/2 ripe avocado', 'Handful baby spinach', 'Pinch chia seeds'],
              recipeSteps: ['Toast sourdough until golden.', 'Mash avocado with lemon juice and sea salt.', 'Soft scramble eggs with spinach.', 'Assemble and top with chia seeds.']
            },
            {
              mealType: 'lunch',
              title: 'Mediterranean Quinoa & Grilled Protein Bowl',
              calories: Math.round(calories * 0.35 || 650),
              protein: 38,
              carbs: 62,
              fat: 22,
              prepTimeMinutes: 15,
              ingredients: ['1 cup cooked quinoa', '120g grilled chicken or crispy tofu', 'Cherry tomatoes & cucumber', '2 tbsp hummus & olive oil drizzle'],
              recipeSteps: ['Warm cooked quinoa in bowl.', 'Top with sliced protein and crisp chopped vegetables.', 'Finish with dollop of hummus and extra virgin olive oil.']
            },
            {
              mealType: 'dinner',
              title: 'Baked Salmon (or Tempeh) with Roasted Asparagus & Sweet Potato',
              calories: Math.round(calories * 0.30 || 550),
              protein: 42,
              carbs: 45,
              fat: 20,
              prepTimeMinutes: 25,
              ingredients: ['150g wild salmon fillet or herb marinated tempeh', '1 medium roasted sweet potato', '1 bunch fresh asparagus', 'Lemon wedge & garlic herbs'],
              recipeSteps: ['Preheat oven to 200°C (400°F).', 'Roast cubed sweet potato with light olive oil for 20 mins.', 'Add salmon and asparagus to tray for final 12 mins until tender.']
            }
          ],
          workout: {
            title: `${availableMinutes || 30}-Min Total Body Functional Flow`,
            category: 'strength',
            durationMinutes: availableMinutes || 30,
            difficulty: 'intermediate',
            description: 'A dynamic routine blending mobility, core stability, and metabolism-boosting functional movement.',
            exercises: [
              { name: 'World’s Greatest Stretch & Inchworm', setsOrTime: '2 sets of 6 reps', restSeconds: 30, tips: 'Keep core tight and open up your thoracic spine.', targetMuscle: 'Full Body & Core' },
              { name: 'Bodyweight or Goblet Squats', setsOrTime: '3 sets of 12 reps', restSeconds: 45, tips: 'Drive through heels, keep chest proud.', targetMuscle: 'Quads & Glutes' },
              { name: 'Push-ups or Incline Bench Press', setsOrTime: '3 sets of 10-12 reps', restSeconds: 45, tips: 'Lower under control for 3 seconds.', targetMuscle: 'Chest & Triceps' },
              { name: 'Alternating Reverse Lunges', setsOrTime: '3 sets of 10 reps/side', restSeconds: 45, tips: 'Step back softly, 90-degree front knee angle.', targetMuscle: 'Legs & Balance' },
              { name: 'Forearm Plank Hold', setsOrTime: '3 sets of 45 seconds', restSeconds: 30, tips: 'Squeeze glutes and draw belly button to spine.', targetMuscle: 'Deep Core' }
            ]
          },
          mindfulness: {
            title: stressLevel === 'high' ? '10-Minute Deep De-Stress Nervous System Reset' : '7-Minute Daily Focus & Gratitude Breath',
            durationMinutes: stressLevel === 'high' ? 10 : 7,
            techniqueSteps: [
              'Find a quiet, comfortable seated posture with relaxed shoulders.',
              'Inhale deeply through your nose for 4 seconds, feeling your diaphragm expand.',
              'Hold gently at the top for 4 seconds.',
              'Exhale slowly through pursed lips for 6 seconds to trigger the parasympathetic rest response.',
              'Scan your body from head to toe, letting go of tension in the jaw and neck.'
            ]
          }
        }
      });
    }

    const prompt = `Generate a personalized 1-day holistic health schedule in JSON format for:
- Health Goal: ${goal}
- Dietary Style: ${diet}
- Target Daily Calories: ~${calories} kcal
- Available Workout Time: ${availableMinutes} minutes
- Current Stress Level: ${stressLevel}

Return strictly a JSON object matching this TypeScript structure:
{
  "title": string,
  "summary": string,
  "meals": Array<{
    "mealType": "breakfast" | "lunch" | "dinner" | "snack",
    "title": string,
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "prepTimeMinutes": number,
    "ingredients": string[],
    "recipeSteps": string[]
  }>,
  "workout": {
    "title": string,
    "category": "strength" | "cardio_hiit" | "mobility_posture",
    "durationMinutes": number,
    "difficulty": "beginner" | "intermediate" | "advanced",
    "description": string,
    "exercises": Array<{ "name": string, "setsOrTime": string, "restSeconds": number, "tips": string, "targetMuscle": string }>
  },
  "mindfulness": {
    "title": string,
    "durationMinutes": number,
    "techniqueSteps": string[]
  }
}
Do not wrap in markdown fences if possible, just raw JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    let parsed = {};
    try {
      parsed = JSON.parse(response.text || '{}');
    } catch (e) {
      console.error('Failed to parse AI JSON:', e);
    }

    res.json({ plan: parsed });
  } catch (error: any) {
    console.error('Generate Day Error:', error);
    res.status(500).json({ error: 'Failed to generate daily plan' });
  }
});

// AI Ingredient Swap / Fridge Chef endpoint
app.post('/api/ai/ingredient-swap', async (req, res) => {
  try {
    const { ingredients, goal } = req.body;
    const ai = getAiClient();

    if (!ai) {
      return res.json({
        recipeTitle: "Quick Vitality Skillet Bowl",
        prepTime: "15 minutes",
        caloriesEst: 460,
        macros: "32g Protein • 38g Carbs • 18g Fat",
        instructions: [
          `Sauté ${ingredients || 'your fresh vegetables and protein'} in a skillet with 1 tsp olive oil and garlic over medium heat.`,
          "Season with sea salt, black pepper, and your favorite herb blend (oregano or paprika).",
          "Serve over a warm bed of brown rice, quinoa, or fresh leafy greens with a squeeze of fresh lemon juice."
        ],
        healthTip: "Combining colorful vegetables with lean protein improves satiety and nutrient density!"
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `I have these ingredients in my kitchen: "${ingredients}". My goal is: ${goal}. 
Give me 1 delicious, healthy recipe idea I can make right now. Return JSON with structure:
{
  "recipeTitle": string,
  "prepTime": string,
  "caloriesEst": number,
  "macros": string,
  "instructions": string[],
  "healthTip": string
}`,
      config: { responseMimeType: 'application/json' }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err) {
    res.status(500).json({ error: 'Failed to suggest recipe' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vitality Server running on http://localhost:${PORT}`);
  });
}

startServer();
