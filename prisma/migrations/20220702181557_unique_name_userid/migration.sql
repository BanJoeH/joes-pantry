/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `Recipe` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Recipe_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_name_userId_key" ON "Recipe"("name", "userId");
