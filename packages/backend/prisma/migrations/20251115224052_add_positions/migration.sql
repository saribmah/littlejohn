-- CreateTable
CREATE TABLE "position" (
    "id" TEXT NOT NULL,
    "portfolioId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "averagePrice" DOUBLE PRECISION NOT NULL,
    "currentPrice" DOUBLE PRECISION NOT NULL,
    "marketValue" DOUBLE PRECISION NOT NULL,
    "totalReturn" DOUBLE PRECISION NOT NULL,
    "totalReturnPercent" DOUBLE PRECISION NOT NULL,
    "dayReturn" DOUBLE PRECISION NOT NULL,
    "dayReturnPercent" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "position_portfolioId_symbol_key" ON "position"("portfolioId", "symbol");

-- AddForeignKey
ALTER TABLE "position" ADD CONSTRAINT "position_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "portfolio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
