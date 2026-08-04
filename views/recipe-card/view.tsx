import { useState } from "react";
import { ThemeProvider, useCallTool, useSendFollowUp, useToolContext } from "mcp-use/react";
import "./view.css";

type Recipe = {
  id: string;
  name: string;
  cuisine: string;
  time: number;
  difficulty: string;
  dietary: string[];
  ingredients: string[];
  description: string;
  image: string;
};

const difficultyColor: Record<string, string> = {
  easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

function RecipeCards() {
  const view = useToolContext<"search-recipes">();
  const getRecipe = useCallTool("get-recipe");
  const sendFollowUp = useSendFollowUp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (view.status === "pending") {
    return <div className="p-5 text-sm text-gray-500">Searching recipes…</div>;
  }
  if (view.status === "error") {
    return <div className="p-5 text-sm text-red-600" role="alert">{view.error.message}</div>;
  }

  const { query, results } = view.toolOutput as { query: string; results: Recipe[] };
  const detail = getRecipe.data?.structuredContent;

  return (
    <main className="p-5 font-sans text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="mb-4">
        <h1 className="m-0 text-lg font-semibold">🍽️ Recipe Finder</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {query ? `Results for "${query}"` : `${results.length} recipes available`}
        </p>
      </header>
      {results.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">No recipes found. Try a different search.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {results.map((recipe) => {
            const expanded = expandedId === recipe.id;
            return (
              <article key={recipe.id} className={`rounded-2xl border p-4 transition-colors ${expanded ? "border-orange-400 bg-orange-50 dark:bg-orange-950/30" : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"}`}>
                <button type="button" className="w-full text-left" onClick={() => { setExpandedId(expanded ? null : recipe.id); if (!expanded) void getRecipe.callTool({ id: recipe.id }); }}>
                  <div className="flex gap-3"><span className="text-3xl">{recipe.image}</span><span><strong className="block">{recipe.name}</strong><span className="text-xs text-gray-500">{recipe.description}</span></span></div>
                  <div className="mt-3 flex flex-wrap gap-1 text-xs"><span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">{recipe.cuisine}</span><span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800">⏱ {recipe.time}m</span><span className={`rounded-full px-2 py-1 ${difficultyColor[recipe.difficulty] ?? "bg-gray-100"}`}>{recipe.difficulty}</span></div>
                </button>
                {expanded && <section className="mt-4 border-t border-orange-200 pt-3 dark:border-orange-900">
                  {getRecipe.isPending ? <p className="text-sm text-gray-500">Loading details…</p> : <><h2 className="text-sm font-semibold">Ingredients</h2><ul className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-600 dark:text-gray-300">{((detail?.id === recipe.id ? detail.ingredients : recipe.ingredients) as string[]).map((ingredient) => <li key={ingredient}>• {ingredient}</li>)}</ul><button type="button" className="mt-3 rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white" onClick={() => void sendFollowUp({ prompt: `Plan a meal with ${recipe.name}` })}>Plan a meal with {recipe.name}</button></>}
                </section>}
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function RecipeCardView() {
  return <ThemeProvider><RecipeCards /></ThemeProvider>;
}
