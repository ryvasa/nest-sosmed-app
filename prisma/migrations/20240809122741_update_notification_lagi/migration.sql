/*
  Warnings:

  - You are about to drop the `comment_notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `thread_notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "comment_notifications" DROP CONSTRAINT "comment_notifications_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "comment_notifications" DROP CONSTRAINT "comment_notifications_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "comment_notifications" DROP CONSTRAINT "comment_notifications_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "comment_notifications" DROP CONSTRAINT "comment_notifications_thread_id_fkey";

-- DropForeignKey
ALTER TABLE "thread_notifications" DROP CONSTRAINT "thread_notifications_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "thread_notifications" DROP CONSTRAINT "thread_notifications_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "thread_notifications" DROP CONSTRAINT "thread_notifications_thread_id_fkey";

-- DropTable
DROP TABLE "comment_notifications";

-- DropTable
DROP TABLE "thread_notifications";

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "action" "ActionType" NOT NULL,
    "thread_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "comment_id" TEXT,
    "readed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notifications_id_key" ON "notifications"("id");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
