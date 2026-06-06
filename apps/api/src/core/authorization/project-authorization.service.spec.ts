import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { Permission, ProjectRole } from '../common/enum/enums';
import { ProjectAuthorizationService } from './project-authorization.service';

describe('ProjectAuthorizationService', () => {
  const findFirst = jest.fn();
  const service = new ProjectAuthorizationService({
    project: { findFirst },
  } as unknown as PrismaService);

  beforeEach(() => findFirst.mockReset());

  it('allows the owner to use every project permission', async () => {
    findFirst.mockResolvedValue({ userId: 'owner', members: [] });

    await expect(
      service.assertPermission('owner', 'project', Permission.projectDelete),
    ).resolves.toBeUndefined();
  });

  it('allows editors to edit but not manage members', async () => {
    findFirst.mockResolvedValue({
      userId: 'owner',
      members: [{ role: ProjectRole.editor }],
    });

    await expect(
      service.assertPermission('editor', 'project', Permission.projectEdit),
    ).resolves.toBeUndefined();
    await expect(
      service.assertPermission(
        'editor',
        'project',
        Permission.projectManageMembers,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows viewers to read but not edit', async () => {
    findFirst.mockResolvedValue({
      userId: 'owner',
      members: [{ role: ProjectRole.viewer }],
    });

    await expect(
      service.assertPermission('viewer', 'project', Permission.projectRead),
    ).resolves.toBeUndefined();
    await expect(
      service.assertPermission('viewer', 'project', Permission.projectEdit),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows admins to manage members but not delete the project', async () => {
    findFirst.mockResolvedValue({
      userId: 'owner',
      members: [{ role: ProjectRole.admin }],
    });

    await expect(
      service.assertPermission(
        'admin',
        'project',
        Permission.projectManageMembers,
      ),
    ).resolves.toBeUndefined();
    await expect(
      service.assertPermission('admin', 'project', Permission.projectDelete),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
