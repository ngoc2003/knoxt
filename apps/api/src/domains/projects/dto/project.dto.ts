import { Field, InputType, Int } from '@nestjs/graphql';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ProjectRole } from '../../../core/common/enum/enums';

@InputType()
export class CreateProjectInput {
  @Field()
  @IsString()
  @MaxLength(200)
  name: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field()
  @IsUUID()
  customerId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  budget?: string;

  @Field(() => String)
  @IsString()
  @IsIn(['active', 'completed', 'on-hold'])
  status: string;

  @Field(() => String)
  @IsDateString()
  startDate: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

@InputType()
export class UpdateProjectInput {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'completed', 'on-hold'])
  status?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

@InputType()
export class CreateProjectColumnInput {
  @Field()
  @IsUUID()
  projectId: string;

  @Field()
  @IsString()
  @MaxLength(100)
  name: string;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  orderIndex?: number;
}

@InputType()
export class ReorderProjectColumnsInput {
  @Field()
  @IsUUID()
  projectId: string;

  @Field(() => [String])
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  columnIds: string[];
}

@InputType()
export class AddProjectMemberInput {
  @Field()
  @IsUUID()
  projectId: string;

  @Field()
  @IsEmail()
  email: string;

  @Field(() => ProjectRole)
  @IsEnum(ProjectRole)
  role: ProjectRole;
}

@InputType()
export class UpdateProjectMemberRoleInput {
  @Field()
  @IsUUID()
  projectId: string;

  @Field()
  @IsUUID()
  memberId: string;

  @Field(() => ProjectRole)
  @IsEnum(ProjectRole)
  role: ProjectRole;
}

@InputType()
export class RemoveProjectMemberInput {
  @Field()
  @IsUUID()
  projectId: string;

  @Field()
  @IsUUID()
  memberId: string;
}

@InputType()
export class CancelProjectInvitationInput {
  @Field()
  @IsUUID()
  projectId: string;

  @Field()
  @IsUUID()
  invitationId: string;
}
