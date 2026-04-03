import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Project } from './project.model';

@ObjectType()
export class ProjectPage {
  @Field(() => [Project])
  items: Project[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  skip: number;

  @Field(() => Int)
  take: number;
}
