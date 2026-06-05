-- CreateTable
CREATE TABLE "AiReportSummary" (
    "id" TEXT NOT NULL,
    "scanReportId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "projectSummary" TEXT NOT NULL,
    "securityReview" TEXT NOT NULL,
    "readmeReview" TEXT NOT NULL,
    "codeStructureReview" TEXT NOT NULL,
    "portfolioFeedback" TEXT NOT NULL,
    "fixPriority" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiReportSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AiReportSummary_scanReportId_key" ON "AiReportSummary"("scanReportId");

-- AddForeignKey
ALTER TABLE "AiReportSummary" ADD CONSTRAINT "AiReportSummary_scanReportId_fkey" FOREIGN KEY ("scanReportId") REFERENCES "ScanReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
