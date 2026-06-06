import { SetMetadata } from '@nestjs/common';
import { Permission } from '../common/enum/enums';

export const PERMISSION_METADATA = 'permission-requirement';

export type PermissionResourceType = 'project' | 'task';

export interface PermissionRequirement {
  permission: Permission;
  resourceType: PermissionResourceType;
  argumentPath: string;
}

export const RequirePermission = (
  permission: Permission,
  resourceType: PermissionResourceType,
  argumentPath: string,
) =>
  SetMetadata(PERMISSION_METADATA, {
    permission,
    resourceType,
    argumentPath,
  } satisfies PermissionRequirement);
