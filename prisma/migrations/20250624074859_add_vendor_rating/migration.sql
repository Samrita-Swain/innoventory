-- AlterTable
ALTER TABLE "invoices" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'INR';

-- AlterTable
ALTER TABLE "vendors" ADD COLUMN     "rating" DOUBLE PRECISION;
