/*
  Warnings:

  - You are about to drop the column `dislike` on the `Comment_Like` table. All the data in the column will be lost.
  - You are about to drop the column `dislike` on the `thread_likes` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment_Like" DROP COLUMN "dislike";

-- AlterTable
ALTER TABLE "thread_likes" DROP COLUMN "dislike";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "token";

-- CreateTable
CREATE TABLE "thread_dislikes" (
    "id" TEXT NOT NULL,
    "dislike" BOOLEAN NOT NULL,
    "user_id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "thread_dislikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment_Dislike" (
    "id" TEXT NOT NULL,
    "dislike" BOOLEAN NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_Dislike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "thread_dislikes_id_key" ON "thread_dislikes"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_Dislike_id_key" ON "Comment_Dislike"("id");

-- AddForeignKey
ALTER TABLE "thread_dislikes" ADD CONSTRAINT "thread_dislikes_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_dislikes" ADD CONSTRAINT "thread_dislikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment_Dislike" ADD CONSTRAINT "Comment_Dislike_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment_Dislike" ADD CONSTRAINT "Comment_Dislike_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
