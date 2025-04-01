/*
  Warnings:

  - The values [MAINTENANCE_MODE,FEATURE_FLAG,SYSTEM_MESSAGE] on the enum `AdminSettingKey` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AdminSettingKey_new" AS ENUM ('H5P_URL');
ALTER TABLE "AdminSetting" ALTER COLUMN "key" TYPE "AdminSettingKey_new" USING ("key"::text::"AdminSettingKey_new");
ALTER TYPE "AdminSettingKey" RENAME TO "AdminSettingKey_old";
ALTER TYPE "AdminSettingKey_new" RENAME TO "AdminSettingKey";
DROP TYPE "AdminSettingKey_old";
COMMIT;
