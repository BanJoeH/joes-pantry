import type { NewIngredient } from "~/models/recipe.server";
import * as React from "react";

type Props = {
  ingredient?: NewIngredient;
  i: number;
  allIngredients?: NewIngredient[];
  shouldFocus?: Boolean;
  setFocused?: () => void;
  deleteIngredient?: (e: React.MouseEvent<HTMLButtonElement>, i: number) => void;
};

export default function IngredientInput({
  ingredient,
  i,
  allIngredients,
  shouldFocus,
  setFocused,
  deleteIngredient
}: Props) {
  const ingredientRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (
      ingredientRef.current &&
      allIngredients &&
      i === allIngredients.length - 1
    ) {
      ingredientRef.current.focus();
      setFocused && setFocused();
    }
  });

  return (
    <>
      <div className="ingredient-input-group">
        
        <label className="flex w-full flex-col gap-1">
          <span>{`Ingredient ${i + 1}: `}</span>
          <input
            name="ingredient"
            defaultValue={ingredient?.name}
            id={`ingredient-${i}`}
            ref={ingredientRef}
            autoComplete="off"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          />
        </label>
        <label>
          <span>Quantity: </span>
          <input
            name="quantity"
            defaultValue={ingredient?.quantity.toString()}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            type="number"
          />
        </label>
        <label>
          <span>Unit: </span>
          <select
            name="unit"
            defaultValue={ingredient?.unit}
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
          >
            <option value="g">Grams</option>
            <option value="kg">Kilos</option>
            <option value="ml">Milliliters</option>
            <option value="l">Liters</option>
          </select>
        </label>

        <div className="button-group">
          {allIngredients && allIngredients.length !== 1 && (
            <label>
              delete ingredient
            <input
              name="deleteIngredient"
              className="ingredient-button delete"
              type="checkbox"
              aria-label="Delete ingredient"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {console.log(e)}}
            />
            </label>
          )}
        </div>
      </div>
    </>
  );
}
