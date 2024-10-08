/*
  Warnings:

  - Added the required column `secretQuestion` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "secretQuestion" TEXT NOT NULL;
