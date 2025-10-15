import { recipes, Recipe } from './recipes-data';
export type { Recipe };

export interface RecipeResponse {
  recipes: Recipe[];
  count: number;
  cuisines: string[];
}

export const api = {
  // Get all recipes with optional search and filtering
  async getRecipes(params?: {
    search?: string;
    cuisine?: string;
    limit?: number;
    offset?: number;
  }): Promise<Recipe[]> {
    let filteredRecipes = recipes;
    
   if (params?.cuisine && params.cuisine !== 'all') {
    const cuisine = params.cuisine;
    filteredRecipes = filteredRecipes.filter(recipe => 
      recipe.cuisine.toLowerCase() === cuisine.toLowerCase()
    );

}
    
    
    if (params?.search) {
      const searchTerm = params.search.toLowerCase();
      filteredRecipes = filteredRecipes.filter(recipe => 
  recipe.cuisine.toLowerCase() === params!.cuisine!.toLowerCase()
);
    }
    
    if (params?.offset) {
      filteredRecipes = filteredRecipes.slice(params.offset);
    }
    
    if (params?.limit) {
      filteredRecipes = filteredRecipes.slice(0, params.limit);
    }
    
    return filteredRecipes;
  },

  // Get a single recipe by ID
  async getRecipe(id: number): Promise<Recipe> {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) {
      throw new Error('Recipe not found');
    }
    return recipe;
  },

  // Get all available cuisines
  async getCuisines(): Promise<string[]> {
    const cuisines = [...new Set(recipes.map(recipe => recipe.cuisine))].sort();
    return cuisines;
  },

  // Get total count of recipes (with optional search)
  async getRecipesCount(search?: string): Promise<number> {
    if (search) {
      const searchTerm = search.toLowerCase();
      return recipes.filter(recipe => 
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.cuisine.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(searchTerm))
      ).length;
    }
    
    return recipes.length;
  },

  // Create a new recipe (not available in static mode)
  async createRecipe(recipe: Omit<Recipe, 'id'>): Promise<Recipe> {
    throw new Error('Cannot create recipe: Static mode');
  },

  // Get recipe recommendations based on ingredients
  async getRecommendations(ingredients: string[]): Promise<{
    recommendations: (Recipe & { matchInfo: {
      matchedIngredients: string[];
      missingIngredients: string[];
      matchPercentage: number;
      coveragePercentage: number;
      score: number;
    }})[];
    count: number;
    searchedIngredients: string[];
  }> {
    // Enhanced local implementation
    const normalizedIngredients = ingredients
      .map(ing => ing.toLowerCase().trim())
      .filter(ing => ing.length > 0);

    const recipeMatches = recipes.map(recipe => {
      const recipeIngredients = recipe.ingredients.map(ing => ing.toLowerCase().trim());
      
      // Enhanced ingredient matching with multiple strategies
      const matchedIngredients = normalizedIngredients.filter(userIngredient => {
        return recipeIngredients.some(recipeIngredient => {
          // Direct match
          if (recipeIngredient === userIngredient) return true;
          
          // Contains match (user ingredient in recipe ingredient)
          if (recipeIngredient.includes(userIngredient)) return true;
          
          // Contains match (recipe ingredient in user ingredient)
          if (userIngredient.includes(recipeIngredient)) return true;
          
          // Word-level matching
          const userWords = userIngredient.split(' ').filter(w => w.length > 2);
          const recipeWords = recipeIngredient.split(' ').filter(w => w.length > 2);
          
          // Check if any significant words match
          return userWords.some(userWord => 
            recipeWords.some(recipeWord => 
              userWord === recipeWord || 
              recipeWord.includes(userWord) || 
              userWord.includes(recipeWord)
            )
          );
        });
      });

      const matchPercentage = (matchedIngredients.length / recipeIngredients.length) * 100;
      const coveragePercentage = (matchedIngredients.length / normalizedIngredients.length) * 100;
      
      // Calculate missing ingredients
      const missingIngredients = recipeIngredients.filter(recipeIngredient => 
        !matchedIngredients.some(matched => {
          return recipeIngredient.includes(matched) || matched.includes(recipeIngredient);
        })
      );

      // Enhanced scoring algorithm
      let score = (matchPercentage * 0.4) + (coveragePercentage * 0.3);
      
      // Bonus for high match percentage
      if (matchPercentage >= 80) score += 15;
      else if (matchPercentage >= 60) score += 10;
      else if (matchPercentage >= 40) score += 5;
      
      // Bonus for high coverage
      if (coveragePercentage >= 80) score += 10;
      else if (coveragePercentage >= 60) score += 5;
      
      // Penalty for too many missing ingredients
      const missingRatio = missingIngredients.length / recipeIngredients.length;
      if (missingRatio > 0.5) score -= 10;
      else if (missingRatio > 0.3) score -= 5;
      
      // Difficulty bonus (easier recipes get slight bonus)
      if (recipe.difficulty === 'Easy') score += 3;
      else if (recipe.difficulty === 'Medium') score += 1;
      
      // Cooking time penalty (very long recipes get slight penalty)
      const totalTime = (recipe.prep_time || 0) + (recipe.cook_time || 0);
      if (totalTime > 120) score -= 2;

      return {
        recipe,
        matchedIngredients,
        missingIngredients,
        matchPercentage,
        coveragePercentage,
        score: Math.max(0, Math.min(100, score)) // Clamp between 0-100
      };
    })
    .filter(match => match.matchPercentage > 0) // Only show recipes with at least some matches
    .sort((a, b) => {
      // Primary sort by score
      if (b.score !== a.score) return b.score - a.score;
      
      // Secondary sort by match percentage
      if (b.matchPercentage !== a.matchPercentage) return b.matchPercentage - a.matchPercentage;
      
      // Tertiary sort by coverage percentage
      return b.coveragePercentage - a.coveragePercentage;
    })
    .slice(0, 15); // Return more recommendations for better variety

    const recommendations = recipeMatches.map(match => ({
      ...match.recipe,
      matchInfo: {
        matchedIngredients: match.matchedIngredients,
        missingIngredients: match.missingIngredients,
        matchPercentage: Math.round(match.matchPercentage),
        coveragePercentage: Math.round(match.coveragePercentage),
        score: Math.round(match.score)
      }
    }));

    return {
      recommendations,
      count: recommendations.length,
      searchedIngredients: normalizedIngredients
    };
  },
};