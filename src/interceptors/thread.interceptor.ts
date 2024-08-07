import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
@Injectable()
export class ThreadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data) => {
        if (typeof data === 'string') {
          return { message: data };
        } else if (data.count && data.threads) {
          return {
            count: data.count,
            threads: data.threads.map((item) => ({
              id: item.id,
              body: item.body,
              created_at: item.created_at,
              user: item.user,
              images: item.images,
              count: item._count,
              thread_likes: item.thread_likes,
              thread_dislikes: item.thread_dislikes,
            })),
          };
        } else if (Array.isArray(data)) {
          return data.map((item) => ({
            id: item.id,
            body: item.body,
            created_at: item.created_at,
            user: item.user,
            images: item.images,
            count: item._count,
            thread_likes: item.thread_likes,
            thread_dislikes: item.thread_dislikes,
          }));
        } else {
          const res = {
            id: data.id,
            body: data.body,
            created_at: data.created_at,
            user: data.user,
            images: data.images,
            comments: data.comments,
            count: data._count,
            thread_likes: data.thread_likes,
            thread_dislikes: data.thread_dislikes,
          };
          return res;
        }
      }),
    );
  }
}
