import React, { useState } from 'react';
import { 
  Utensils, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  ShoppingCart, 
  Sparkles, 
  Search, 
  ChefHat, 
  ArrowRight,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MealPlanItem, UserProfile } from '../types';

interface NutritionViewProps {
  meals: MealPlanItem[];
  completedMealIds: string[];
  onToggleMeal: (id: string) => void;
  userProfile: UserProfile;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  meals,
  completedMealIds,
  onToggleMeal,
  userProfile
}) => {
  const [filter, setFilter] = useState<'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack'>('all');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(meals[0]?.id || null);
  const [activeSubTab, setActiveSubTab] = useState<'recipes' | 'grocery' | 'fridge_chef'>('recipes');
  const [checkedGroceryItems, setCheckedGroceryItems] = useState<string[]>([]);

  // AI Fridge Chef state
  const [fridgeInput, setFridgeInput] = useState('');
  const [isChefLoading, setIsChefLoading] = useState(false);
  const [chefRecipe, setChefRecipe] = useState<any | null>(null);

  // Calculate consumed calories today
  const consumedMeals = meals.filter(m => completedMealIds.includes(m.id));
  const consumedCalories = consumedMeals.reduce((sum, m) => sum + m.calories, 0);
  const consumedProtein = consumedMeals.reduce((sum, m) => sum + m.protein, 0);

  const filteredMeals = filter === 'all' ? meals : meals.filter(m => m.mealType === filter);

  // Generate Grocery List from all meals
  const groceryList = Array.from(new Set(meals.flatMap(m => m.ingredients))).map((item, idx) => ({
    id: `g-${idx}`,
    text: item
  }));

  const toggleGroceryItem = (id: string) => {
    setCheckedGroceryItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAskFridgeChef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fridgeInput.trim()) return;

    setIsChefLoading(true);
    try {
      const res = await fetch('/api/ai/ingredient-swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: fridgeInput,
          goal: userProfile.goal
        })
      });
      const data = await res.json();
      setChefRecipe(data);
    } catch (err) {
      setChefRecipe({
        recipeTitle: "Vitality Herb Skillet Bowl",
        prepTime: "15 mins",
        caloriesEst: 480,
        macros: "32g Protein • 38g Carbs • 18g Fat",
        instructions: [
          `Lightly sauté ${fridgeInput} in 1 tsp extra virgin olive oil with minced garlic over medium heat.`,
          "Season with sea salt, cracked black pepper, and your favorite dry herbs.",
          "Serve warm over leafy greens or steamed quinoa with a squeeze of fresh lemon."
        ],
        healthTip: "Combining healthy fats with vegetables helps your body absorb fat-soluble vitamins A, D, E, and K!"
      });
    } finally {
      setIsChefLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Utensils className="w-7 h-7 text-emerald-600" />
            <span>Personalized Nutrition & Recipes</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Nourishing your body with balanced macros tailored for <span className="font-semibold text-emerald-700 capitalize">{userProfile.diet.replace('_', ' ')}</span> eating.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab('recipes')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === 'recipes' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Daily Meal Planner
          </button>
          <button
            onClick={() => setActiveSubTab('grocery')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === 'grocery' ? 'bg-white text-emerald-800 shadow-xs' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Grocery List</span>
          </button>
          <button
            onClick={() => setActiveSubTab('fridge_chef')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeSubTab === 'fridge_chef' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>AI Fridge Chef</span>
          </button>
        </div>
      </div>

      {/* Daily Macro Progress Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">Calories Consumed</div>
          <div className="text-2xl font-extrabold text-emerald-950">
            {consumedCalories} <span className="text-sm font-normal text-gray-500">/ {userProfile.targetCalories} kcal</span>
          </div>
          <div className="w-full bg-emerald-200/50 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (consumedCalories / userProfile.targetCalories) * 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200/70 rounded-2xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Protein Intake</div>
          <div className="text-2xl font-extrabold text-gray-900">
            {consumedProtein}g <span className="text-sm font-normal text-gray-500">logged</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Essential for tissue repair & enzymes</p>
        </div>

        <div className="bg-white border border-gray-200/70 rounded-2xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Diet Style</div>
          <div className="text-xl font-extrabold text-emerald-700 capitalize">
            {userProfile.diet.replace('_', ' ')}
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Wholesome, anti-inflammatory whole foods</p>
        </div>

        <div className="bg-white border border-gray-200/70 rounded-2xl p-4 shadow-2xs">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Logged Today</div>
          <div className="text-2xl font-extrabold text-gray-900">
            {consumedMeals.length} <span className="text-sm font-normal text-gray-500">of {meals.length} items</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-2 font-medium">Click any card to mark eaten</p>
        </div>
      </div>

      {activeSubTab === 'recipes' && (
        <div className="space-y-6">
          {/* Meal Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            <span className="text-xs font-semibold text-gray-400 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {(['all', 'breakfast', 'lunch', 'dinner', 'snack'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  filter === f
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/60'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Recipe Cards List */}
          <div className="grid grid-cols-1 gap-6">
            {filteredMeals.map((meal) => {
              const isCompleted = completedMealIds.includes(meal.id);
              const isExpanded = expandedRecipeId === meal.id;

              return (
                <div 
                  key={meal.id}
                  className={`bg-white rounded-3xl border transition-all shadow-sm overflow-hidden ${
                    isCompleted ? 'border-emerald-300 bg-emerald-50/20' : 'border-gray-200/80 hover:border-emerald-200'
                  }`}
                >
                  <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => onToggleMeal(meal.id)}
                        className="mt-1 shrink-0"
                        title={isCompleted ? 'Mark as not eaten' : 'Mark as eaten today'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-7 h-7 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-7 h-7 text-gray-300 hover:text-emerald-500 transition-colors" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            {meal.mealType}
                          </span>
                          {meal.tags.map((tag, idx) => (
                            <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <h3 className={`text-lg sm:text-xl font-bold text-gray-900 ${isCompleted ? 'line-through decoration-emerald-500/50' : ''}`}>
                          {meal.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-2xl">
                          {meal.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                      <div className="flex items-center gap-4 text-xs font-semibold text-gray-700">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          {meal.calories} kcal
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-blue-500" />
                          {meal.prepTimeMinutes}m prep
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 font-medium">
                        {meal.protein}g P • {meal.carbs}g C • {meal.fat}g F
                      </div>

                      <button
                        onClick={() => setExpandedRecipeId(isExpanded ? null : meal.id)}
                        className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 py-1"
                      >
                        <span>{isExpanded ? 'Hide Recipe' : 'View Recipe & Steps'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Recipe & Ingredients Box */}
                  {isExpanded && (
                    <div className="bg-gray-50/80 border-t border-gray-100 p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2 duration-200">
                      <div className="space-y-3">
                        <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                          <ShoppingCart className="w-4 h-4 text-emerald-600" />
                          Ingredients ({meal.ingredients.length})
                        </h4>
                        <ul className="space-y-2">
                          {meal.ingredients.map((ing, idx) => (
                            <li key={idx} className="text-xs sm:text-sm text-gray-700 flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200/60 shadow-2xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span>{ing}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="md:col-span-2 space-y-3">
                        <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                          <ChefHat className="w-4 h-4 text-emerald-600" />
                          Step-by-Step Preparation
                        </h4>
                        <ol className="space-y-3">
                          {meal.recipeSteps.map((step, idx) => (
                            <li key={idx} className="text-xs sm:text-sm text-gray-700 flex gap-3 bg-white p-3 rounded-xl border border-gray-200/60 shadow-2xs">
                              <span className="font-bold text-emerald-700 shrink-0 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-xs">
                                {idx + 1}
                              </span>
                              <span className="leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'grocery' && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <span>Weekly Grocery & Pantry Checklist</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">Compiled from your active daily nutrition recipes. Check off items as you shop!</p>
            </div>
            <button
              onClick={() => setCheckedGroceryItems([])}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline"
            >
              Reset Checked ({checkedGroceryItems.length})
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {groceryList.map((item) => {
              const isChecked = checkedGroceryItems.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => toggleGroceryItem(item.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-50/50 border-emerald-300 text-gray-400 line-through'
                      : 'bg-white border-gray-200 hover:border-emerald-300 shadow-2xs'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                    isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 bg-gray-50'
                  }`}>
                    {isChecked && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                  <span className="text-xs sm:text-sm font-medium">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'fridge_chef' && (
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Fridge Chef & Ingredient Swap</span>
            </div>
            <h2 className="text-2xl font-bold">What do you have in your fridge or pantry right now?</h2>
            <p className="text-xs sm:text-sm text-emerald-100/80">
              Type 3 or 4 random ingredients you have on hand, and our AI Chef will invent a wholesome, goal-aligned recipe for you in seconds.
            </p>
          </div>

          <form onSubmit={handleAskFridgeChef} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={fridgeInput}
              onChange={(e) => setFridgeInput(e.target.value)}
              placeholder="e.g. 2 eggs, baby spinach, canned chickpeas, lemon..."
              className="flex-1 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-sm text-white placeholder-emerald-200/50 focus:outline-hidden focus:ring-2 focus:ring-emerald-400"
            />
            <button
              type="submit"
              disabled={isChefLoading || !fridgeInput.trim()}
              className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isChefLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <ChefHat className="w-4 h-4" />}
              <span>{isChefLoading ? 'Inventing Recipe...' : 'Create Recipe'}</span>
            </button>
          </form>

          {chefRecipe && (
            <div className="bg-white text-gray-900 rounded-2xl p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    AI Custom Creation
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mt-1">{chefRecipe.recipeTitle}</h3>
                </div>
                <div className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  ⏱️ {chefRecipe.prepTime} • 🔥 ~{chefRecipe.caloriesEst} kcal
                </div>
              </div>

              <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">
                Macros: {chefRecipe.macros}
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500">Preparation Steps</h4>
                <ol className="space-y-2">
                  {chefRecipe.instructions?.map((inst: string, i: number) => (
                    <li key={i} className="text-xs sm:text-sm text-gray-700 flex gap-2">
                      <span className="font-bold text-emerald-600">{i + 1}.</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {chefRecipe.healthTip && (
                <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span><strong>Nutrition Note:</strong> {chefRecipe.healthTip}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
