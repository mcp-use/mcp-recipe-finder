import {
  MCPServer,
  text,
  widget,
  object,
  markdown,
  mix,
  completable,
} from "mcp-use/server";
import { z } from "zod";

const server = new MCPServer({
  name: "recipe-finder",
  title: "Recipe Finder",
  version: "1.0.0",
  description: "Recipe discovery — showcasing middleware, prompts, and resources",
  baseUrl: process.env.MCP_URL || "http://localhost:3000",
  favicon: "favicon.ico",
  icons: [
    { src: "icon.svg", mimeType: "image/svg+xml", sizes: ["512x512"] },
  ],
});

// ---------------------------------------------------------------------------
// HTTP Middleware — request logging (Hono layer)
// ---------------------------------------------------------------------------

server.use(async (c, next) => {
  const start = Date.now();
  console.log(`→ ${c.req.method} ${c.req.url}`);
  await next();
  console.log(`← ${c.req.method} ${c.req.url} [${Date.now() - start}ms]`);
});

// ---------------------------------------------------------------------------
// MCP Operation Middleware — intercept tool calls at the protocol level
// ---------------------------------------------------------------------------

server.use("mcp:tools/call", async (ctx, next) => {
  console.log(`🔧 Tool called: ${ctx.params.name}`);
  const start = Date.now();
  const result = await next();
  console.log(`🔧 Tool ${ctx.params.name} completed in ${Date.now() - start}ms`);
  return result;
});

// ---------------------------------------------------------------------------
// Recipe Data
// ---------------------------------------------------------------------------

const recipes = [
  {
    id: "1",
    name: "Spaghetti Carbonara",
    cuisine: "italian",
    time: 25,
    difficulty: "easy",
    dietary: ["gluten"],
    ingredients: ["spaghetti", "eggs", "pecorino", "guanciale", "black pepper"],
    description: "Classic Roman pasta dish with creamy egg sauce",
    image: "🍝",
  },
  {
    id: "2",
    name: "Pad Thai",
    cuisine: "thai",
    time: 30,
    difficulty: "medium",
    dietary: ["gluten-free"],
    ingredients: ["rice noodles", "shrimp", "peanuts", "bean sprouts", "lime"],
    description: "Sweet and tangy Thai stir-fried noodles",
    image: "🍜",
  },
  {
    id: "3",
    name: "Chicken Tikka Masala",
    cuisine: "indian",
    time: 45,
    difficulty: "medium",
    dietary: ["gluten-free"],
    ingredients: ["chicken", "yogurt", "tomatoes", "garam masala", "cream"],
    description: "Tender chicken in a rich spiced tomato-cream sauce",
    image: "🍛",
  },
  {
    id: "4",
    name: "Sushi Roll",
    cuisine: "japanese",
    time: 50,
    difficulty: "hard",
    dietary: ["gluten-free", "dairy-free"],
    ingredients: ["sushi rice", "nori", "salmon", "avocado", "rice vinegar"],
    description: "Fresh fish and vegetables rolled in seasoned rice",
    image: "🍣",
  },
  {
    id: "5",
    name: "Tacos al Pastor",
    cuisine: "mexican",
    time: 35,
    difficulty: "medium",
    dietary: ["gluten-free", "dairy-free"],
    ingredients: ["pork", "pineapple", "cilantro", "onion", "corn tortillas"],
    description: "Spit-roasted pork tacos with pineapple and fresh salsa",
    image: "🌮",
  },
  {
    id: "6",
    name: "French Onion Soup",
    cuisine: "french",
    time: 60,
    difficulty: "medium",
    dietary: ["vegetarian"],
    ingredients: ["onions", "beef broth", "gruyère", "baguette", "thyme"],
    description: "Caramelized onion soup topped with melted cheese croutons",
    image: "🧅",
  },
  {
    id: "7",
    name: "Greek Salad",
    cuisine: "mediterranean",
    time: 10,
    difficulty: "easy",
    dietary: ["vegetarian", "gluten-free"],
    ingredients: ["tomatoes", "cucumber", "feta", "olives", "red onion"],
    description: "Crisp vegetables with tangy feta and olive oil",
    image: "🥗",
  },
  {
    id: "8",
    name: "BBQ Cheeseburger",
    cuisine: "american",
    time: 20,
    difficulty: "easy",
    dietary: [],
    ingredients: ["ground beef", "cheddar", "brioche bun", "lettuce", "bbq sauce"],
    description: "Juicy smashed burger with smoky BBQ and melted cheese",
    image: "🍔",
  },
];

type Recipe = (typeof recipes)[number];

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

server.tool(
  {
    name: "search-recipes",
    description:
      "Search for recipes by keyword, cuisine, cooking time, or dietary preference. " +
      "Returns a visual card grid of matching recipes.",
    schema: z.object({
      query: z.string().optional().describe("Free-text search (name or ingredient)"),
      cuisine: z
        .enum([
          "italian",
          "thai",
          "indian",
          "japanese",
          "mexican",
          "french",
          "mediterranean",
          "american",
        ])
        .optional()
        .describe("Filter by cuisine type"),
      maxTime: z.number().optional().describe("Maximum cooking time in minutes"),
      dietary: z
        .enum([
          "vegetarian",
          "gluten-free",
          "dairy-free",
          "gluten",
        ])
        .optional()
        .describe("Dietary restriction filter"),
    }),
    widget: {
      name: "recipe-card",
      invoking: "Searching recipes...",
      invoked: "Recipes found",
    },
  },
  async ({ query, cuisine, maxTime, dietary }) => {
    let results = [...recipes];

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.toLowerCase().includes(q))
      );
    }
    if (cuisine) {
      results = results.filter((r) => r.cuisine === cuisine);
    }
    if (maxTime !== undefined) {
      results = results.filter((r) => r.time <= maxTime);
    }
    if (dietary) {
      results = results.filter((r) => r.dietary.includes(dietary));
    }

    await new Promise((resolve) => setTimeout(resolve, 800));

    return widget({
      props: { query: query ?? "", results },
      output: text(
        `Found ${results.length} recipe${results.length !== 1 ? "s" : ""} matching "${query ?? "all"}"`
      ),
    });
  }
);

server.tool(
  {
    name: "get-recipe",
    description: "Get full details for a specific recipe by ID",
    schema: z.object({
      id: z.string().describe("The recipe ID"),
    }),
    outputSchema: z.object({
      id: z.string(),
      name: z.string(),
      cuisine: z.string(),
      time: z.number(),
      difficulty: z.string(),
      dietary: z.array(z.string()),
      ingredients: z.array(z.string()),
      description: z.string(),
      image: z.string(),
    }),
  },
  async ({ id }) => {
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) {
      return text(`Recipe with id "${id}" not found.`);
    }

    return mix(
      text(`Recipe: ${recipe.name}`),
      markdown(
        `## ${recipe.image} ${recipe.name}\n\n` +
          `**Cuisine:** ${recipe.cuisine}  \n` +
          `**Time:** ${recipe.time} min  \n` +
          `**Difficulty:** ${recipe.difficulty}\n\n` +
          `### Ingredients\n` +
          recipe.ingredients.map((i) => `- ${i}`).join("\n") +
          `\n\n_${recipe.description}_`
      )
    );
  }
);

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

server.resource(
  {
    name: "recipe_catalog",
    uri: "recipe://catalog",
    title: "Recipe Catalog",
    description: "Full catalog of all available recipes",
    mimeType: "application/json",
  },
  async () => object(recipes)
);

server.resourceTemplate(
  {
    name: "recipe_by_id",
    uriTemplate: "recipe://{id}",
    title: "Recipe Details",
    description: "Get a single recipe by its ID",
    mimeType: "application/json",
    callbacks: {
      complete: {
        id: recipes.map((r) => r.id),
      },
    },
  },
  async (uri: URL, params: Record<string, string>) => {
    const { id } = params;
    const recipe = recipes.find((r) => r.id === id);
    if (!recipe) {
      return text(`Recipe not found: ${id}`);
    }
    return object(recipe);
  }
);

// ---------------------------------------------------------------------------
// Prompts with completable()
// ---------------------------------------------------------------------------

server.prompt(
  {
    name: "meal-plan",
    description: "Generate a weekly meal plan based on cuisine and dietary preferences",
    schema: z.object({
      cuisine: completable(
        z.string().describe("Preferred cuisine"),
        [
          "italian",
          "thai",
          "japanese",
          "mexican",
          "indian",
          "french",
          "american",
          "mediterranean",
        ]
      ),
      dietary: completable(
        z.string().describe("Dietary restriction"),
        [
          "none",
          "vegetarian",
          "vegan",
          "gluten-free",
          "dairy-free",
          "keto",
          "paleo",
        ]
      ),
      days: z.number().min(1).max(7).default(7).describe("Number of days"),
    }),
  },
  async ({ cuisine, dietary, days }) => {
    return {
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Create a ${days}-day meal plan featuring ${cuisine} cuisine` +
              (dietary !== "none"
                ? ` with ${dietary} dietary restrictions`
                : "") +
              `. Include breakfast, lunch, and dinner for each day.`,
          },
        },
      ],
    };
  }
);

server.prompt(
  {
    name: "recipe-suggestion",
    description: "Get recipe suggestions based on available ingredients",
    schema: z.object({
      ingredients: z.string().describe("Comma-separated list of ingredients you have"),
      mealType: completable(
        z.string().describe("Type of meal"),
        ["breakfast", "lunch", "dinner", "snack", "dessert"]
      ),
    }),
  },
  async ({ ingredients, mealType }) => {
    return {
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text:
              `Suggest ${mealType} recipes I can make with these ingredients: ${ingredients}. ` +
              `For each suggestion, list the recipe name, any additional ingredients needed, ` +
              `estimated cooking time, and brief instructions.`,
          },
        },
      ],
    };
  }
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

server.listen().then(() => {
  console.log("Recipe Finder running");
});
