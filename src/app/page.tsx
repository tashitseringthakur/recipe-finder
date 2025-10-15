'use client';

import { useState, useEffect } from 'react';
import { api, Recipe } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, Users, ChefHat, Filter, Loader2, Sparkles } from 'lucide-react';

export default function RecipeFinder() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);
  
  // New states for ingredient search
  const [searchMode, setSearchMode] = useState<'recipe' | 'ingredient'>('recipe');
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [isGettingRecommendations, setIsGettingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const recipesPerPage = 12;

  // Load cuisines on mount
  useEffect(() => {
    const loadCuisines = async () => {
      try {
        const cuisineList = await api.getCuisines();
        setCuisines(cuisineList);
      } catch (error) {
        console.error('Failed to load cuisines:', error);
      }
    };
    loadCuisines();
  }, []);

  // Load recipes
  const loadRecipes = async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setCurrentPage(0);
      } else {
        setIsSearching(true);
      }

      const offset = reset ? 0 : currentPage * recipesPerPage;
      const params: any = {
        limit: recipesPerPage,
        offset: offset,
      };

      if (searchTerm.trim()) {
        params.search = searchTerm;
      }

      if (selectedCuisine && selectedCuisine !== 'all') {
        params.cuisine = selectedCuisine;
      }

      const [recipesData, count] = await Promise.all([
        api.getRecipes(params),
        api.getRecipesCount(searchTerm.trim() || undefined),
      ]);

      if (reset) {
        setRecipes(recipesData);
      } else {
        setRecipes(prev => [...prev, ...recipesData]);
      }

      setTotalCount(count);
      setHasMore(offset + recipesPerPage < count);
    } catch (error) {
      console.error('Failed to load recipes:', error);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadRecipes(true);
  }, []);

  // Handle search
  const handleSearch = () => {
    loadRecipes(true);
  };

  // Handle cuisine filter
  useEffect(() => {
    loadRecipes(true);
  }, [selectedCuisine]);

  // Load more recipes
  const loadMore = async () => {
    if (!isSearching && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      
      try {
        setIsSearching(true);
        
        const offset = nextPage * recipesPerPage;
        const params: any = {
          limit: recipesPerPage,
          offset: offset,
        };

        if (searchTerm.trim()) {
          params.search = searchTerm;
        }

        if (selectedCuisine && selectedCuisine !== 'all') {
          params.cuisine = selectedCuisine;
        }

        const [recipesData, count] = await Promise.all([
          api.getRecipes(params),
          api.getRecipesCount(searchTerm.trim() || undefined),
        ]);

        setRecipes(prev => [...prev, ...recipesData]);
        setTotalCount(count);
        setHasMore(offset + recipesPerPage < count);
      } catch (error) {
        console.error('Failed to load recipes:', error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Handle enter key in search
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchMode === 'recipe') {
        handleSearch();
      } else {
        handleAddIngredient();
      }
    }
  };

  // Add ingredient to the list
  const handleAddIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setIngredientInput('');
    }
  };

  // Remove ingredient from the list
  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients(ingredients.filter(ing => ing !== ingredientToRemove));
  };

  // Get recipe recommendations based on ingredients
  const handleGetRecommendations = async () => {
    if (ingredients.length === 0) return;
    
    try {
      setIsGettingRecommendations(true);
      const result = await api.getRecommendations(ingredients);
      setRecommendations(result.recommendations);
      setTotalCount(result.count);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
    } finally {
      setIsGettingRecommendations(false);
    }
  };

  // Clear ingredient search
  const handleClearIngredientSearch = () => {
    setIngredients([]);
    setRecommendations([]);
    setIngredientInput('');
  };

  // Toggle search mode
  const handleToggleSearchMode = (mode: 'recipe' | 'ingredient') => {
    setSearchMode(mode);
    if (mode === 'recipe') {
      // Switch back to recipe search results
      loadRecipes(true);
    } else {
      // Clear and prepare for ingredient search
      setRecommendations([]);
      setIngredients([]);
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get total time
  const getTotalTime = (recipe: Recipe) => {
    const prep = recipe.prep_time || 0;
    const cook = recipe.cook_time || 0;
    const total = prep + cook;
    return total > 0 ? `${total} min` : 'N/A';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {searchMode === 'ingredient' ? 'Recipe Recommendations' : 'Recipe Finder'}
            </h1>
            <p className="text-lg text-gray-600">
              {searchMode === 'ingredient' 
                ? 'Find recipes you can make with your ingredients'
                : `Discover ${totalCount}+ delicious recipes from around the world`
              }
            </p>
          </div>
        </div>
      </header>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {/* Search Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-gray-100 rounded-lg p-1 inline-flex">
              <button
                onClick={() => handleToggleSearchMode('recipe')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchMode === 'recipe'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Search className="h-4 w-4 inline mr-2" />
                Recipe Search
              </button>
              <button
                onClick={() => handleToggleSearchMode('ingredient')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  searchMode === 'ingredient'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Sparkles className="h-4 w-4 inline mr-2" />
                Ingredient Search
              </button>
            </div>
          </div>

          {searchMode === 'recipe' ? (
            // Recipe Search Mode
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search by recipe name, cuisine, or ingredients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 text-base"
                  />
                </div>
              </div>

              {/* Cuisine Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                  <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                    <SelectTrigger className="pl-10 h-12">
                      <SelectValue placeholder="All Cuisines" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cuisines</SelectItem>
                      {cuisines.map((cuisine) => (
                        <SelectItem key={cuisine} value={cuisine}>
                          {cuisine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleSearch}
                  className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // Ingredient Search Mode
            <div className="space-y-4">
              {/* Popular Ingredient Suggestions */}
              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">Popular ingredients:</p>
                <div className="flex flex-wrap gap-2">
                  {['chicken', 'tomatoes', 'onions', 'garlic', 'rice', 'pasta', 'potatoes', 'eggs'].map((ingredient) => (
                    <Button
                      key={ingredient}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!ingredients.includes(ingredient)) {
                          setIngredients([...ingredients, ingredient]);
                        }
                      }}
                      className="text-xs h-7 px-3"
                      disabled={ingredients.includes(ingredient)}
                    >
                      {ingredient}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Ingredient Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Enter an ingredient (e.g., chicken, tomatoes, rice)..."
                    value={ingredientInput}
                    onChange={(e) => setIngredientInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <Button 
                  onClick={handleAddIngredient}
                  className="h-12 px-6 bg-green-500 hover:bg-green-600 text-white font-medium"
                >
                  Add
                </Button>
              </div>

              {/* Ingredients List */}
              {ingredients.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {ingredients.map((ingredient, index) => (
                      <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
                        {ingredient}
                        <button
                          onClick={() => handleRemoveIngredient(ingredient)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleGetRecommendations}
                      className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                      disabled={isGettingRecommendations || ingredients.length === 0}
                    >
                      {isGettingRecommendations ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Get Recommendations'
                      )}
                    </Button>
                    <Button 
                      onClick={handleClearIngredientSearch}
                      variant="outline"
                      className="h-12 px-6"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Results Summary */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-4">
            <span>
              {searchMode === 'ingredient' 
                ? `Found ${totalCount} recommendation${totalCount !== 1 ? 's' : ''}`
                : `Found ${totalCount} recipe${totalCount !== 1 ? 's' : ''}`
              }
            </span>
            {searchMode === 'recipe' && (searchTerm || (selectedCuisine && selectedCuisine !== 'all')) && (
              <div className="flex gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    "{searchTerm}"
                  </Badge>
                )}
                {selectedCuisine && selectedCuisine !== 'all' && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {selectedCuisine}
                  </Badge>
                )}
              </div>
            )}
            {searchMode === 'ingredient' && ingredients.length > 0 && (
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Ingredients: {ingredients.join(', ')}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Recipe Grid */}
        {(isLoading || isGettingRecommendations) ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {(searchMode === 'ingredient' ? recommendations : recipes).map((recipe) => (
                <Card 
                  key={recipe.id} 
                  className={`overflow-hidden hover:shadow-lg transition-all duration-300 group ${
                    expandedRecipe === recipe.id ? 'md:col-span-2 lg:col-span-2 xl:col-span-2' : ''
                  }`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={`/images/${recipe.image}`}
                      alt={recipe.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Try multiple fallback strategies
                        const fallbackImages = [
                          `https://picsum.photos/seed/${recipe.name.replace(/\s+/g, '%20')}/400/300.jpg`,
                          `https://picsum.photos/seed/${recipe.cuisine.replace(/\s+/g, '%20')}/400/300.jpg`,
                          `https://picsum.photos/seed/recipe-${recipe.id}/400/300.jpg`,
                          '/images/placeholder-food.jpg' // Add a placeholder image if available
                        ];
                        
                        // Try each fallback until one works
                        let fallbackIndex = 0;
                        const tryNextFallback = () => {
                          if (fallbackIndex < fallbackImages.length) {
                            target.src = fallbackImages[fallbackIndex];
                            fallbackIndex++;
                          }
                        };
                        
                        target.onerror = tryNextFallback;
                        tryNextFallback();
                      }}
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs">
                        {recipe.cuisine}
                      </Badge>
                      {recipe.difficulty && (
                        <Badge className={`text-xs ${getDifficultyColor(recipe.difficulty)}`}>
                          {recipe.difficulty}
                        </Badge>
                      )}
                      {searchMode === 'ingredient' && recipe.matchInfo && (
                        <Badge 
                          className={`text-xs ${
                            recipe.matchInfo.score >= 80 ? 'bg-green-100 text-green-800 border-green-200' :
                            recipe.matchInfo.score >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-orange-100 text-orange-800 border-orange-200'
                          }`}
                        >
                          {recipe.matchInfo.score}% Match
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {recipe.name}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Recipe Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{getTotalTime(recipe)}</span>
                        </div>
                        {recipe.servings && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{recipe.servings} servings</span>
                          </div>
                        )}
                      </div>

                      {/* Collapsible Content */}
                      {expandedRecipe === recipe.id ? (
                        <div className="space-y-4 animate-in slide-in-from-top duration-300">
                          {/* Full Ingredients List */}
                          <div>
                            <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <ChefHat className="h-4 w-4" />
                              Ingredients ({recipe.ingredients.length})
                            </h3>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                              {recipe.ingredients.map((ingredient, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {ingredient}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Match Quality Score (for recommendations) */}
                          {searchMode === 'ingredient' && recipe.matchInfo && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-medium text-gray-700 flex items-center gap-2">
                                  <Sparkles className="h-4 w-4" />
                                  Match Quality
                                </h3>
                                <Badge 
                                  className={`${
                                    recipe.matchInfo.score >= 80 ? 'bg-green-100 text-green-800' :
                                    recipe.matchInfo.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-orange-100 text-orange-800'
                                  }`}
                                >
                                  {recipe.matchInfo.score}% Match
                                </Badge>
                              </div>
                              
                              {/* Progress bar for visual match quality */}
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    recipe.matchInfo.score >= 80 ? 'bg-green-500' :
                                    recipe.matchInfo.score >= 60 ? 'bg-yellow-500' :
                                    'bg-orange-500'
                                  }`}
                                  style={{ width: `${recipe.matchInfo.score}%` }}
                                />
                              </div>
                              
                              <div className="text-xs text-gray-600 flex justify-between">
                                <span>{recipe.matchInfo.matchPercentage}% recipe coverage</span>
                                <span>{recipe.matchInfo.coveragePercentage}% ingredient usage</span>
                              </div>
                            </div>
                          )}

                          {/* Matched Ingredients (for recommendations) */}
                          {searchMode === 'ingredient' && recipe.matchInfo && (
                            <div className="mb-3">
                              <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                Matched Ingredients ({recipe.matchInfo.matchedIngredients.length})
                              </h3>
                              <div className="flex flex-wrap gap-1">
                                {recipe.matchInfo.matchedIngredients.slice(0, 6).map((ingredient, index) => (
                                  <Badge key={index} className="text-xs bg-green-100 text-green-800 border-green-200">
                                    {ingredient}
                                  </Badge>
                                ))}
                                {recipe.matchInfo.matchedIngredients.length > 6 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{recipe.matchInfo.matchedIngredients.length - 6} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Missing Ingredients (for recommendations) */}
                          {searchMode === 'ingredient' && recipe.matchInfo && recipe.matchInfo.missingIngredients && recipe.matchInfo.missingIngredients.length > 0 && (
                            <div className="mb-3">
                              <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                Missing Ingredients ({recipe.matchInfo.missingIngredients.length})
                              </h3>
                              <div className="flex flex-wrap gap-1">
                                {recipe.matchInfo.missingIngredients.slice(0, 4).map((ingredient, index) => (
                                  <Badge key={index} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                    {ingredient}
                                  </Badge>
                                ))}
                                {recipe.matchInfo.missingIngredients.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{recipe.matchInfo.missingIngredients.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Full Instructions */}
                          <div>
                            <h3 className="font-medium text-gray-700 mb-2">Instructions</h3>
                            <div className="text-sm text-gray-600 space-y-2 max-h-64 overflow-y-auto pr-2">
                              {(() => {
                                const instructions = recipe.instructions;
                                
                                // Strategy 1: Split by numbered steps (e.g., "1. Do this. 2. Do that.")
                                if (instructions.match(/\d+\./)) {
                                  const steps = instructions.split(/\d+\.\s*/).filter(step => step.trim());
                                  return steps.map((step, index) => (
                                    <div key={index} className="flex gap-2 p-2 bg-gray-50 rounded">
                                      <span className="font-medium text-orange-600 min-w-fit">
                                        {index + 1}:
                                      </span>
                                      <span className="whitespace-pre-wrap">{step.trim()}</span>
                                    </div>
                                  ));
                                }
                                
                                // Fallback: Just display the instructions as-is with line breaks
                                else {
                                  return (
                                    <div className="p-2 bg-gray-50 rounded whitespace-pre-wrap">
                                      {instructions}
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </div>

                          {/* Additional Details */}
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            {recipe.prep_time && (
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-medium text-gray-700">Prep</div>
                                <div className="text-gray-600">{recipe.prep_time} min</div>
                              </div>
                            )}
                            {recipe.cook_time && (
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-medium text-gray-700">Cook</div>
                                <div className="text-gray-600">{recipe.cook_time} min</div>
                              </div>
                            )}
                            {recipe.servings && (
                              <div className="text-center p-2 bg-gray-50 rounded">
                                <div className="font-medium text-gray-700">Servings</div>
                                <div className="text-gray-600">{recipe.servings}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Ingredients Preview */}
                          <div>
                            <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <ChefHat className="h-4 w-4" />
                              Ingredients
                            </h3>
                            <div className="flex flex-wrap gap-1">
                              {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {ingredient}
                                </Badge>
                              ))}
                              {recipe.ingredients.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{recipe.ingredients.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Instructions Preview */}
                          <div>
                            <h3 className="font-medium text-gray-700 mb-2">Instructions</h3>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {recipe.instructions}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Toggle Button */}
                      <Button 
                        variant="outline" 
                        className="w-full mt-4 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                        onClick={() => setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id)}
                      >
                        {expandedRecipe === recipe.id ? (
                          <>
                            <span>Show Less</span>
                          </>
                        ) : (
                          <>
                            <span>View Full Recipe</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && recipes.length > 0 && searchMode === 'recipe' && (
              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isSearching}
                  className="px-8 py-3"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Load More Recipes
                </Button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!isLoading && !isGettingRecommendations && 
         ((searchMode === 'recipe' && recipes.length === 0) || 
          (searchMode === 'ingredient' && recommendations.length === 0)) && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              {searchMode === 'ingredient' ? (
                <Sparkles className="h-16 w-16 mx-auto" />
              ) : (
                <Search className="h-16 w-16 mx-auto" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchMode === 'ingredient' ? 'No recipe recommendations found' : 'No recipes found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchMode === 'ingredient' 
                ? ingredients.length === 0 
                  ? 'Add some ingredients to get personalized recipe recommendations'
                  : `No recipes match your ingredients: ${ingredients.join(', ')}. Try adding more common ingredients or different items.`
                : 'Try searching for different ingredients, recipe names, or adjust the cuisine filter'
              }
            </p>
            {searchMode === 'ingredient' && ingredients.length > 0 && (
              <Button 
                onClick={handleClearIngredientSearch}
                variant="outline"
                className="px-6"
              >
                Clear Ingredients & Start Over
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>Recipe Finder - Discover delicious meals from around the world</p>
            <p className="text-sm mt-2">{totalCount}+ recipes • {cuisines.length}+ cuisines • Advanced search</p>
            <p className="text-xs mt-2">Powered by Python FastAPI & Next.js</p>
          </div>
        </div>
      </footer>
    </div>
  );
}