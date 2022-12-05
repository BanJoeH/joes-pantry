import type { User, Recipe, Ingredient } from "@prisma/client"


import { prisma } from "~/db.server"
export type { Recipe } from "@prisma/client"
export type NewIngredient = Pick<Ingredient, "name" | "quantity" | "unit">

export type RecipeAndIngredients = Recipe & {
    ingredients: NewIngredient[]
}


export function getRecipe({
    id,
    userId
}: Pick<Recipe, "id"> & {
    userId: User["id"];
}) {
    return prisma.recipe.findFirst({
        where: { id, userId },
        include: { ingredients: true }
    });
}

export function getRecipeListItems({ userId }: { userId: User["id"] }) {
    return prisma.recipe.findMany({
        where: { userId },
        select: { id: true, name: true, ingredients: true, linkUrl: true },
        orderBy: { updatedAt: "desc" },
    });
}

export function createRecipe({
    name,
    linkUrl,
    userId,
    ingredients,
}: Pick<Recipe, "name" | "linkUrl" | "userId"> & {
    ingredients: NewIngredient[]
}) {
    return prisma.recipe.create({
        data: {
            name,
            user: {
                connect: {
                    id: userId,
                },
            },
            linkUrl,
            ingredients: {
                createMany: { data: ingredients }
            }
        },
        select: {
            ingredients: {
                select: {
                    name: true,
                    quantity: true,
                    unit: true,
                    id: true,
                }
            },
            id: true,
            name: true,
            linkUrl: true,
            user: {
                select: {
                    id: true,
                }
            }
        },
    });

}