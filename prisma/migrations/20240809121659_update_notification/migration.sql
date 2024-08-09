/*
  Warnings:

  - You are about to drop the column `user_id` on the `comment_notifications` table. All the data in the column will be lost.
  - Added the required column `thread_id` to the `comment_notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "comment_notifications" DROP COLUMN "user_id",
ADD COLUMN     "readed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "thread_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "thread_notifications" ADD COLUMN     "readed" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "comment_notifications" ADD CONSTRAINT "comment_notifications_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
