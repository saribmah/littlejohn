/*
  Warnings:

  - You are about to drop the column `completedSteps` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `shouldOnboard` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "completedSteps",
DROP COLUMN "shouldOnboard";

-- CreateTable
CREATE TABLE "onboarding_profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "robinhoodEmail" TEXT,
    "robinhoodLinked" BOOLEAN NOT NULL DEFAULT false,
    "goal" TEXT,
    "riskLevel" TEXT,
    "period" INTEGER,
    "exclusions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_profile_userId_key" ON "onboarding_profile"("userId");

-- AddForeignKey
ALTER TABLE "onboarding_profile" ADD CONSTRAINT "onboarding_profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
