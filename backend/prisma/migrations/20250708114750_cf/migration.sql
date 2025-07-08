/*
  Warnings:

  - A unique constraint covering the columns `[codeforcesHandle]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_codeforcesHandle_key" ON "User"("codeforcesHandle");
