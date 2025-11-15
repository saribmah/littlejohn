-- CreateTable
CREATE TABLE "portfolio" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dayChangeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dayChangePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weekChangeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weekChangePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthChangeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthChangePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "threeMonthChangeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "threeMonthChangePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "yearChangeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "yearChangePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portfolio_userId_key" ON "portfolio"("userId");

-- AddForeignKey
ALTER TABLE "portfolio" ADD CONSTRAINT "portfolio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
