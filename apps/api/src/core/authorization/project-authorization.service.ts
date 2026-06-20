import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Permission, ProjectRole } from '../common/enum/enums';

const ROLE_PERMISSIONS: Record<ProjectRole, Permission[]> = {
  [ProjectRole.viewer]: [Permission.projectRead],
  [ProjectRole.editor]: [Permission.projectRead, Permission.projectEdit],
  [ProjectRole.admin]: [
    Permission.projectRead,
    Permission.projectEdit,
    Permission.projectManageMembers,
    Permission.projectViewAudit,
  ],
};

@Injectable()
export class ProjectAuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async assertPermission(
    userId: string,
    projectId: string,
    permission: Permission,
  ) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, deletedAt: null },
      select: {
        userId: true,
        members: {
          where: { userId },
          select: { role: true },
        },
      },
    });

    const role = project?.members[0]?.role as ProjectRole | undefined;
    const allowed =
      project?.userId === userId ||
      (role ? ROLE_PERMISSIONS[role].includes(permission) : false);

    if (!allowed) {
      throw new ForbiddenException(
        'You do not have permission for this project',
      );
    }
  }
}
