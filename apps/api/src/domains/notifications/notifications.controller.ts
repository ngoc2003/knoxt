import {
  Controller,
  MessageEvent,
  Query,
  Sse,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { NotificationsService } from './notifications.service';

interface JwtPayload {
  sub: string;
}

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
  ) {}

  @Sse('stream')
  stream(@Query('token') token?: string): Observable<MessageEvent> {
    if (!token) throw new UnauthorizedException();

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      return this.notificationsService.stream(payload.sub);
    } catch {
      throw new UnauthorizedException();
    }
  }
}
