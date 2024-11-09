/*
  Warnings:

  - Added the required column `joinedOn` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "joinedOn" TIMESTAMP(3) NOT NULL;
