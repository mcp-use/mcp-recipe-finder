import {
  McpUseProvider,
  useCallTool,
  useWidget,
  type WidgetMetadata,
} from "mcp-use/react";
import React, { useState } from "react";
import "../styles.css";
import { propSchema, type RecipeCardProps } from "./types";

export const widgetMetadata: WidgetMetadata = {
  description: "Grid of recipe cards with detail expansion and meal planning",
  props: propSchema,
  exposeAsTool: false,
  metadata: {
    prefersBorder: true,
    invoking: "Searching recipes...",
    invoked: "Recipes found",
  },
};

type Recipe = RecipeCardProps["results"][number];

const difficultyColor: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

const cuisineColor: Record<string, string> = {
  italian: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300",
  thai: "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-300",
  indian: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  japanese: "bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300",
  mexican: "bg-lime-50 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300",
  french: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300",
  mediterranean: "bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300",
  american: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
};

function Badge({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium leading-tight ${className}`}>
      {children}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 animate-pulse">
      <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700 mb-3" />
      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
      <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700 mb-3" />
      <div className="flex gap-1.5">
        <div className="h-5 w-14 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="h-5 w-10 rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

const RecipeCard: React.FC = () => {
  const {
    props,
    isPending,
    sendFollowUpMessage,
  } = useWidget<RecipeCardProps>();

  const {
    callTool: getRecipe,
    data: recipeDetail,
    isPending: isLoadingDetail,
  } = useCallTool("get-recipe");

  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isPending) {
    return (
      <McpUseProvider autoSize>
        <div className="p-5">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="h-5 w-5 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Searching recipes...
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </McpUseProvider>
    );
  }

  const { query, results } = props;

  const handleCardClick = (recipe: Recipe) => {
    if (expandedId === recipe.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(recipe.id);
    getRecipe({ id: recipe.id });
  };

  return (
    <McpUseProvider autoSize>
      <div className="p-5">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            🍽️ Recipe Finder
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {query
              ? `Results for "${query}"`
              : `${results.length} recipe${results.length !== 1 ? "s" : ""} available`}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-10">
            <span className="text-4xl mb-3 block">🔍</span>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No recipes found. Try a different search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {results.map((recipe) => {
              const isExpanded = expandedId === recipe.id;

              return (
                <div
                  key={recipe.id}
                  className={`
                    rounded-2xl border transition-all duration-200 cursor-pointer
                    ${
                      isExpanded
                        ? "col-span-2 border-orange-300 dark:border-orange-600 bg-orange-50/50 dark:bg-orange-950/20 shadow-md"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-200 dark:hover:border-orange-700 hover:shadow-sm"
                    }
                  `}
                  onClick={() => handleCardClick(recipe)}
                >
                  <div className="p-4">
                    {/* Icon + Title */}
                    <div className="flex items-start gap-3">
                      <span className="text-3xl leading-none shrink-0 mt-0.5">
                        {recipe.image}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                          {recipe.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                          {recipe.description}
                        </p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      <Badge className={cuisineColor[recipe.cuisine] ?? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"}>
                        {recipe.cuisine}
                      </Badge>
                      <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                        ⏱ {recipe.time}m
                      </Badge>
                      <Badge className={difficultyColor[recipe.difficulty] ?? ""}>
                        {recipe.difficulty}
                      </Badge>
                    </div>

                    {/* Dietary tags */}
                    {recipe.dietary.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {recipe.dietary.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="mt-4 pt-3 border-t border-orange-200 dark:border-orange-800" onClick={(e) => e.stopPropagation()}>
                        {isLoadingDetail ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">Loading details...</span>
                          </div>
                        ) : (
                          <>
                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                              Ingredients
                            </h4>
                            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 mb-3">
                              {recipe.ingredients.map((ing) => (
                                <li
                                  key={ing}
                                  className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5"
                                >
                                  <span className="w-1 h-1 rounded-full bg-orange-400 shrink-0" />
                                  {ing}
                                </li>
                              ))}
                            </ul>
                            <button
                              onClick={() =>
                                sendFollowUpMessage(
                                  `Plan a meal with ${recipe.name}`
                                )
                              }
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 transition-colors cursor-pointer"
                            >
                              🗓 Plan a meal with {recipe.name}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </McpUseProvider>
  );
};

export default RecipeCard;
