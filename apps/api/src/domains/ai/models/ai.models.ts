import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AiMessage {
  @Field(() => ID)
  id: string;

  @Field()
  role: string;

  @Field()
  content: string;

  @Field(() => ID)
  sessionId: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}

@ObjectType()
export class AiSession {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  title?: string | null;

  @Field(() => [AiMessage])
  messages: AiMessage[];

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
