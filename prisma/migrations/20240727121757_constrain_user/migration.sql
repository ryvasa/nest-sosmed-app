-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_room_id_fkey";

-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_user_id_fkey";

-- DropForeignKey
ALTER TABLE "comment_dislikes" DROP CONSTRAINT "comment_dislikes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "comment_likes" DROP CONSTRAINT "comment_likes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_user_id_fkey";

-- DropForeignKey
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_user_id_fkey";

-- DropForeignKey
ALTER TABLE "thread_dislikes" DROP CONSTRAINT "thread_dislikes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "thread_likes" DROP CONSTRAINT "thread_likes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "threads" DROP CONSTRAINT "threads_user_id_fkey";

-- AddForeignKey
ALTER TABLE "threads" ADD CONSTRAINT "threads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_likes" ADD CONSTRAINT "thread_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thread_dislikes" ADD CONSTRAINT "thread_dislikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_likes" ADD CONSTRAINT "comment_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment_dislikes" ADD CONSTRAINT "comment_dislikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chats" ADD CONSTRAINT "chats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
