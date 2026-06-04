import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class CreateAiSessionInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;
}

@InputType()
export class SendAiMessageInput {
  @Field()
  @IsString()
  sessionId: string;

  @Field()
  @IsString()
  @MaxLength(10000)
  content: string;
}
