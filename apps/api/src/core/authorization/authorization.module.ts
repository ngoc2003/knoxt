import { Global, Module } from '@nestjs/common';
import { ProjectAuthorizationService } from './project-authorization.service';
import { PermissionGuard } from './permission.guard';

@Global()
@Module({
  providers: [ProjectAuthorizationService, PermissionGuard],
  exports: [ProjectAuthorizationService, PermissionGuard],
})
export class AuthorizationModule {}
