import { z } from "zod";

export const propSchema = z.object({
  query: z.string().optional(),
  results: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      cuisine: z.string(),
      time: z.number(),
      difficulty: z.string(),
      dietary: z.array(z.string()),
      ingredients: z.array(z.string()),
      description: z.string(),
      image: z.string(),
    })
  ),
});

export type RecipeCardProps = z.infer<typeof propSchema>;
