-- Add new columns to Medicine
ALTER TABLE "Medicine" ADD COLUMN "brandName" TEXT;
ALTER TABLE "Medicine" ADD COLUMN "genericName" TEXT;
ALTER TABLE "Medicine" ADD COLUMN "gstPercent" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Add new columns to Invoice
ALTER TABLE "Invoice" ADD COLUMN "mobileNumber" TEXT;
ALTER TABLE "Invoice" ADD COLUMN "discount" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Invoice" ADD COLUMN "grandTotal" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Add new columns to InvoiceItem
ALTER TABLE "InvoiceItem" ADD COLUMN "medicineId" TEXT;
ALTER TABLE "InvoiceItem" ADD COLUMN "gst" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "InvoiceItem" ADD COLUMN "total" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Add foreign key constraint for InvoiceItem to Medicine
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
