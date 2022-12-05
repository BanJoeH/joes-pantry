import type { Ingredient } from "@prisma/client";
import type { ActionFunction, LoaderArgs, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useCatch, useLoaderData } from "@remix-run/react";

import invariant from "tiny-invariant";

import type { Recipe } from "~/models/recipe.server";
// import { deleteRecipe } from "~/models/recipe.server";
import { getRecipe } from "~/models/recipe.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  recipe: Recipe & { ingredients: Ingredient[] };
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.recipeId, "recipeId not found");

  const recipe = await getRecipe({ userId, id: params.recipeId });
  if (!recipe) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ recipe });
};

// export const action: ActionFunction = async ({ request, params }) => {
//   const userId = await requireUserId(request);
//   invariant(params.RecipeId, "RecipeId not found");

//   await deleteRecipe({ userId, id: params.RecipeId });

//   return redirect("/Recipes");
// };

export default function RecipeDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.recipe.name}</h3>
      <p className="py-6">{data.recipe.linkUrl}</p>
      <ul className="py-6">
        {data.recipe.ingredients.map(({ name, quantity, unit, id }) => {
          return (
            <li key={id}>
              {name} {quantity} {unit}
            </li>
          );
        })}
      </ul>
      <hr className="my-4" />
      <Form method="post">
        <button
          type="submit"
          className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          Delete
        </button>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Recipe not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
