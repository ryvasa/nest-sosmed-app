-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "readed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false;
