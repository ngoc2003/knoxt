import { Injectable, MessageEvent } from '@nestjs/common';
import { Observable, Subject, finalize, map } from 'rxjs';
import { Notification } from 'database/generated/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { NotificationType } from '../../core/common/enum/enums';

@Injectable()
export class NotificationsService {
  private readonly streams = new Map<string, Set<Subject<Notification>>>();

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, type: NotificationType, message: string) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, message },
    });

    for (const stream of this.streams.get(userId) ?? []) {
      stream.next(notification);
    }

    return notification;
  }

  findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    return true;
  }

  stream(userId: string): Observable<MessageEvent> {
    const subject = new Subject<Notification>();
    const userStreams = this.streams.get(userId) ?? new Set();
    userStreams.add(subject);
    this.streams.set(userId, userStreams);

    return subject.pipe(
      map((notification) => ({ data: notification })),
      finalize(() => {
        userStreams.delete(subject);
        if (userStreams.size === 0) {
          this.streams.delete(userId);
        }
      }),
    );
  }
}
