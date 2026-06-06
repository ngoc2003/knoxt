import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { CustomerStatus } from '../../core/common/enum/enums';

@ObjectType()
export class Customer {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => String, { nullable: true })
  company?: string | null;

  @Field(() => CustomerStatus)
  status: CustomerStatus;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
