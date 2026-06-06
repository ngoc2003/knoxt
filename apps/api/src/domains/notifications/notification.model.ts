import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { NotificationType } from '../../core/common/enum/enums';

@ObjectType()
export class Notification {
  @Field(() => ID)
  id: string;

  @Field(() => NotificationType)
  type: NotificationType;

  @Field()
  message: string;

  @Field()
  read: boolean;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}
