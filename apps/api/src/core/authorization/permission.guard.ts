import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { ProjectAuthorizationService } from './project-authorization.service';
import {
  PERMISSION_METADATA,
  PermissionRequirement,
} from './require-permission.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly projectAuthorization: ProjectAuthorizationService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requirement = this.reflector.getAllAndOverride<PermissionRequirement>(
      PERMISSION_METADATA,
      [context.getHandler(), context.getClass()],
    );
    if (!requirement) return true;

    const gql = GqlExecutionContext.create(context);
    const user = gql.getContext<{ req: { user: AuthUser } }>().req.user;
    const resourceId = this.readPath(gql.getArgs(), requirement.argumentPath);
    if (typeof resourceId !== 'string') {
      throw new BadRequestException('Unable to resolve permission resource');
    }

    const projectId =
      requirement.resourceType === 'project'
        ? resourceId
        : await this.findTaskProjectId(resourceId);
    await this.projectAuthorization.assertPermission(
      user.id,
      projectId,
      requirement.permission,
    );
    return true;
  }

  private readPath(value: unknown, path: string): unknown {
    return path
      .split('.')
      .reduce<unknown>(
        (current, key) =>
          current && typeof current === 'object'
            ? (current as Record<string, unknown>)[key]
            : undefined,
        value,
      );
  }

  private async findTaskProjectId(taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      select: { projectId: true },
    });
    if (!task) throw new BadRequestException('Task not found');
    return task.projectId;
  }
}
