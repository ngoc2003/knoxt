import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiSession, AiMessage } from './models/ai.models';
import { CreateAiSessionInput, SendAiMessageInput } from './dto/ai.dto';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';

@Resolver()
@UseGuards(GqlAuthGuard)
export class AiResolver {
  constructor(private readonly aiService: AiService) {}

  @Query(() => [AiSession])
  aiSessions(@CurrentUser() user: AuthUser) {
    return this.aiService.findSessions(user.id);
  }

  @Query(() => AiSession)
  aiSession(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.aiService.findSession(user.id, id);
  }

  @Mutation(() => AiSession)
  createAiSession(
    @CurrentUser() user: AuthUser,
    @Args('data') data: CreateAiSessionInput,
  ) {
    return this.aiService.createSession(user.id, data);
  }

  @Mutation(() => AiMessage)
  sendAiMessage(
    @CurrentUser() user: AuthUser,
    @Args('input') input: SendAiMessageInput,
  ) {
    return this.aiService.sendMessage(user.id, input);
  }

  @Mutation(() => AiSession)
  deleteAiSession(@CurrentUser() user: AuthUser, @Args('id') id: string) {
    return this.aiService.deleteSession(user.id, id);
  }
}
