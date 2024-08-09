/*
  Warnings:

  - You are about to drop the `CommentNotifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ThreadNotifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "ActionType" ADD VALUE 'DISLIKE';

-- DropForeignKey
ALTER TABLE "CommentNotifications" DROP CONSTRAINT "CommentNotifications_comment_id_fkey";

-- DropForeignKey
ALTER TABLE "CommentNotifications" DROP CONSTRAINT "CommentNotifications_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "CommentNotifications" DROP CONSTRAINT "CommentNotifications_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "ThreadNotifications" DROP CONSTRAINT "ThreadNotifications_receiver_id_fkey";

-- DropForeignKey
ALTER TABLE "ThreadNotifications" DROP CONSTRAINT "ThreadNotifications_sender_id_fkey";

-- DropForeignKey
ALTER TABLE "ThreadNotifications" DROP CONSTRAINT "ThreadNotifications_thread_id_fkey";

-- DropTable
DROP TABLE "CommentNotifications";

-- DropTable
DROP TABLE "ThreadNotifications";

-- CreateTable
CREATE TABLE "thread_notifications" (
    "id" TEXT NOT NULL,
    "action" "ActionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "thread_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,

    CONSTRAINT "thread_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comment_notifications" (
    "id" TEXT NOT NULL,
    "action" "ActionType" NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiver_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,

    CONSTRAINT "comment_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "thread_notifications_id_key" ON "thread_notifications"("id");

-- CreateIndex
CREATE UNIQUE INDEX "comment_notifications_id_key" ON "comment_notifications"("id");

-- AddForeignKey
ALTER TABLE "thread_notifications" ADD CONSTRAINT "thread_notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_notifications" ADD CONSTRAINT "thread_notifications_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_notifications" ADD CONSTRAINT "thread_notifications_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_notifications" ADD CONSTRAINT "comment_notifications_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_notifications" ADD CONSTRAINT "comment_notifications_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_notifications" ADD CONSTRAINT "comment_notifications_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "Comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
