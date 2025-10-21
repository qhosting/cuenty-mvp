-- AlterTable: Add password field to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- CreateIndex: Add unique constraint to phone field
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'User_phone_key'
    ) THEN
        CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
    END IF;
END $$;
