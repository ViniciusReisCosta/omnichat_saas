CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'failed', 'canceled');

ALTER TABLE "Company"
ADD COLUMN "paymentStatus_new" "PaymentStatus" NOT NULL DEFAULT 'pending';

UPDATE "Company"
SET "paymentStatus_new" = CASE
  WHEN "paymentStatus" IN ('active', 'paid') THEN 'paid'::"PaymentStatus"
  WHEN "paymentStatus" IN ('failed', 'overdue', 'unpaid') THEN 'failed'::"PaymentStatus"
  WHEN "paymentStatus" = 'canceled' THEN 'canceled'::"PaymentStatus"
  ELSE 'pending'::"PaymentStatus"
END;

ALTER TABLE "Company"
ALTER COLUMN "active" SET DEFAULT false;

ALTER TABLE "Company"
DROP COLUMN "paymentStatus";

ALTER TABLE "Company"
RENAME COLUMN "paymentStatus_new" TO "paymentStatus";

CREATE UNIQUE INDEX "Company_stripeCustomerId_key" ON "Company"("stripeCustomerId");
CREATE UNIQUE INDEX "Company_stripeSubscriptionId_key" ON "Company"("stripeSubscriptionId");
