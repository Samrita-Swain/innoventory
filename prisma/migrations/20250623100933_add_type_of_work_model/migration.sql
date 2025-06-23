-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "agreementFileUrl" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "clientOnboardingDate" TIMESTAMP(3),
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "companyType" TEXT,
ADD COLUMN     "dpiitCertificateUrl" TEXT,
ADD COLUMN     "dpiitRegister" TEXT,
ADD COLUMN     "dpiitValidTill" TIMESTAMP(3),
ADD COLUMN     "gstFileUrl" TEXT,
ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "individualName" TEXT,
ADD COLUMN     "ndaFileUrl" TEXT,
ADD COLUMN     "otherDocsUrls" TEXT[],
ADD COLUMN     "panCardFileUrl" TEXT,
ADD COLUMN     "pointOfContact" TEXT,
ADD COLUMN     "quotationFileUrl" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "tdsFileUrl" TEXT,
ADD COLUMN     "udhyamRegistrationUrl" TEXT,
ADD COLUMN     "username" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "employmentAgreementUrl" TEXT,
ADD COLUMN     "ndaFileUrl" TEXT,
ADD COLUMN     "otherDocsUrls" TEXT[],
ADD COLUMN     "panCardFileUrl" TEXT,
ADD COLUMN     "panNumber" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "subAdminOnboardingDate" TIMESTAMP(3),
ADD COLUMN     "tdsFileUrl" TEXT,
ADD COLUMN     "termOfWork" TEXT,
ADD COLUMN     "username" TEXT;

-- CreateTable
CREATE TABLE "type_of_work" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "type_of_work_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "type_of_work_name_key" ON "type_of_work"("name");

-- AddForeignKey
ALTER TABLE "type_of_work" ADD CONSTRAINT "type_of_work_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
