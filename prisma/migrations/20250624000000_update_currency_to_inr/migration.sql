-- Update existing orders currency from USD to INR
UPDATE "orders" SET "currency" = 'INR' WHERE "currency" = 'USD';

-- Update existing invoices currency from USD to INR  
UPDATE "invoices" SET "currency" = 'INR' WHERE "currency" = 'USD';
