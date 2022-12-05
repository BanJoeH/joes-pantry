import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";
import * as React from "react";

import type { RecipeAndIngredients } from "~/models/recipe.server";
import { createRecipe } from "~/models/recipe.server";
import { requireUserId } from "~/session.server";
import IngredientInput from "~/components/ingredient-input";

type ActionData = {
  errors?: {
    name?: string;
    linkUrl?: string;
    ingredients?: string;
    quantities?: string;
    units?: string;
  };
};

const getFormDataOrSearchParamValues = (
  formDataOrSearchParam: FormData | URLSearchParams
) => {
  const name = formDataOrSearchParam.get("name") ?? "";
  const linkUrl = formDataOrSearchParam.get("linkUrl") || "";
  const ingredientNames = formDataOrSearchParam.getAll("ingredient") || [];
  const deleteCheckboxes =
    formDataOrSearchParam.getAll("deleteIngredient") || [];
  console.log(deleteCheckboxes);
  const quantities = formDataOrSearchParam.getAll("quantity") || [];
  const units = formDataOrSearchParam.getAll("unit") || [];
  return { name, linkUrl, ingredientNames, quantities, units };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const { name, linkUrl, ingredientNames, quantities, units } =
    getFormDataOrSearchParamValues(formData);

  console.log(name, linkUrl, ingredientNames, quantities, units);

  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    );
  }

  if (typeof linkUrl !== "string") {
    return json<ActionData>(
      { errors: { linkUrl: "Link url must be a string" } },
      { status: 400 }
    );
  }
  if (!Array.isArray(ingredientNames)) {
    return json<ActionData>(
      { errors: { ingredients: "At least 1 ingredient must be defined" } },
      { status: 400 }
    );
  }
  if (
    ingredientNames.some(
      (ingredient) => typeof ingredient !== "string" || ingredient.length === 0
    )
  ) {
    return json<ActionData>(
      { errors: { ingredients: "Ingredients must be strings" } },
      { status: 400 }
    );
  }

  if (!Array.isArray(quantities)) {
    return json<ActionData>(
      { errors: { quantities: "At least 1 ingredient must be defined" } },
      { status: 400 }
    );
  }
  if (quantities.some((q) => typeof q !== "string" || q.length === 0)) {
    return json<ActionData>(
      { errors: { quantities: "Quantities must be strings" } },
      { status: 400 }
    );
  }
  if (quantities.some((q) => Number.isNaN(Number(q)))) {
    return json<ActionData>(
      { errors: { quantities: "Quantities must be numbers" } },
      { status: 400 }
    );
  }
  if (!Array.isArray(units)) {
    return json<ActionData>(
      { errors: { units: "At least 1 ingredient must be defined" } },
      { status: 400 }
    );
  }

  const mappedIngredients = ingredientNames.map((ingredient, i) => ({
    name: ingredient.toString(),
    quantity: parseFloat(quantities[i].toString()),
    unit: units[i].toString(),
  }));

  if (
    !ingredientNames ||
    !ingredientNames.length ||
    !Array.isArray(ingredientNames)
  ) {
    return json<ActionData>(
      { errors: { ingredients: "ingredient name must be set" } },
      { status: 400 }
    );
  }

  const recipe = await createRecipe({
    name,
    linkUrl,
    userId,
    ingredients: mappedIngredients.filter(
      (ingredient) => ingredient.name.length > 0
    ),
  });

  console.log(recipe);

  return redirect(`/recipes/${recipe.id}`);
};

type LoaderData = Pick<RecipeAndIngredients, "name" | "linkUrl" | "ingredients">;

export const loader: LoaderFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const { name, linkUrl, ingredientNames, quantities, units } =
    getFormDataOrSearchParamValues(searchParams);

  const mappedIngredients = ingredientNames.map((ingredient, i) => ({
    name: ingredient.toString(),
    quantity: parseFloat(quantities[i].toString()),
    unit: units[i].toString(),
  }));

  const returnData = {
    name: name.toString(),
    linkUrl: linkUrl.toString(),
    ingredients: [...mappedIngredients, { name: "", quantity: 0, unit: "" }],
  };

  return json<LoaderData>(returnData);
};

export default function NewRecipePage() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData() as ActionData;
  const nameRef = React.useRef<HTMLInputElement>(null);
  const linkUrlRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus();
    } else if (actionData?.errors?.linkUrl) {
      linkUrlRef.current?.focus();
    }
  }, [actionData]);

  return (
    <>
      <Form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Name: </span>
            <input
              ref={nameRef}
              name="name"
              defaultValue={loaderData?.name}
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.name ? true : undefined}
              aria-errormessage={
                actionData?.errors?.name ? "name-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.name && (
            <div className="pt-1 text-red-700" id="name-error">
              {actionData.errors.name}
            </div>
          )}
        </div>

        <div>
          <label className="flex w-full flex-col gap-1">
            <span>Link URL: </span>
            <input
              ref={linkUrlRef}
              name="linkUrl"
              defaultValue={loaderData?.linkUrl || ""}
              className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
              aria-invalid={actionData?.errors?.linkUrl ? true : undefined}
              aria-errormessage={
                actionData?.errors?.linkUrl ? "linkUrl-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.linkUrl && (
            <div className="pt-1 text-red-700" id="linkUrl-error">
              {actionData.errors.linkUrl}
            </div>
          )}
        </div>
        {loaderData.ingredients.map((ingredient, i) => (
          <IngredientInput
            key={i}
            i={i}
            ingredient={ingredient}
            allIngredients={loaderData.ingredients}
          />
        ))}

        <div className="text-right">
          <button
            type="submit"
            className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            formMethod="POST"
          >
            Save
          </button>
        </div>
        <div className="text-right">
          <button
            type="submit"
            className="rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
            formMethod="GET"
          >
            Add Ingredient
          </button>
        </div>
      </Form>
    </>
  );
}
