import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
@Injectable()
export class CommentInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data) => {
        if (typeof data === 'string') {
          return { message: data };
        } else if (typeof data === 'number') {
          return { count: data };
        } else if (Array.isArray(data)) {
          return data.map((item) => ({
            id: item.id,
            body: item.body,
            created_at: item.created_at,
            user: {
              id: item.user.id,
              avatar: item.user.avatar,
              username: item.user.username,
              active: item.user.active,
            },
            count: item._count,
          }));
        } else {
          const res = {
            id: data.id,
            body: data.body,
            created_at: data.created_at,
            user: {
              id: data.user.id,
              avatar: data.user.avatar,
              username: data.user.username,
              active: data.user.active,
            },
            count: data._count,
          };
          return res;
        }
      }),
    );
  }
}
