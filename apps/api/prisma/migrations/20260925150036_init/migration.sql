-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('POTHOLE', 'DAMAGED_SIGN', 'STREETLIGHT_OUT', 'DEBRIS', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('RECEIVED', 'IN_PROGRESS', 'RESOLVED');

-- CreateTable
CREATE TABLE "road_issue_reports" (
    "id" UUID NOT NULL,
    "reference" VARCHAR(16) NOT NULL,
    "issue_type" "IssueType" NOT NULL,
    "location" VARCHAR(200) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "noticed_on" DATE NOT NULL,
    "contact_email" VARCHAR(254),
    "status" "ReportStatus" NOT NULL DEFAULT 'RECEIVED',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "road_issue_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "road_issue_reports_reference_key" ON "road_issue_reports"("reference");

-- CreateIndex
CREATE INDEX "road_issue_reports_status_created_at_idx" ON "road_issue_reports"("status", "created_at");
