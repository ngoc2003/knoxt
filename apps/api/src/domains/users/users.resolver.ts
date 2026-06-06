/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../core/common/guards/gql-auth.guard';
import {
  CurrentUser,
  AuthUser,
} from '../../core/common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { User } from './user.model';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() authUser: AuthUser): Promise<User> {
    const user = await this.usersService.findById(authUser.id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
