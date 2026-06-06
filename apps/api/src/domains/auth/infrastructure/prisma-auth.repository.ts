import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import type { IAuthRepository } from '../application/ports/auth.repository';

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(data: {
    email: string;
    name: string;
    passwordHash: string;
  }) {
    return this.prisma.user.create({ data });
  }

  async claimProjectInvitations(userId: string, email: string, token?: string) {
    if (!token) return;
    const matchingInvitation = await this.prisma.projectInvitation.findFirst({
      where: { token, email: { equals: email, mode: 'insensitive' } },
      select: { id: true },
    });
    if (!matchingInvitation) return;

    const invitations = await this.prisma.projectInvitation.findMany({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
    if (invitations.length === 0) return;

    await this.prisma.$transaction([
      this.prisma.projectMember.createMany({
        data: invitations.map((invitation) => ({
          projectId: invitation.projectId,
          userId,
          role: invitation.role,
        })),
        skipDuplicates: true,
      }),
      this.prisma.projectInvitation.deleteMany({
        where: { id: { in: invitations.map((invitation) => invitation.id) } },
      }),
    ]);
  }
}
