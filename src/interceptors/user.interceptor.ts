import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
@Injectable()
export class UserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data) => {
        if (typeof data === 'string') {
          return { message: data };
        } else if (Array.isArray(data)) {
          return data.map((item) => ({
            id: item.id,
            avatar: item.avatar,
            username: item.username,
            active: item.active,
            created_at: item.created_at,
            updated_at: item.updated_at,
          }));
        } else {
          const res = {
            id: data.id,
            avatar: data.avatar,
            username: data.username,
            active: data.active,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
          return res;
        }
      }),
    );
  }
}
