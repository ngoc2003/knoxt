import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from '@nestjs/graphql';
import { Test } from '@nestjs/testing';
import { GraphQLSchema } from 'graphql';
import {
  CreateDecisionInput,
  CreateMeetingInput,
  CreateRequirementInput,
} from './project-knowledge.dto';
import { ProjectKnowledgeResolver } from './project-knowledge.resolver';

describe('project knowledge GraphQL inputs', () => {
  let schemaFactory: GraphQLSchemaFactory;
  let schema: GraphQLSchema;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
    }).compile();
    schemaFactory = module.get(GraphQLSchemaFactory);
    schema = await schemaFactory.create([ProjectKnowledgeResolver]);
  });

  it.each([
    ['CreateDecisionInput', CreateDecisionInput],
    ['CreateMeetingInput', CreateMeetingInput],
    ['CreateRequirementInput', CreateRequirementInput],
  ])('%s exposes the shared project entity fields', async (name) => {
    const input = schema.getType(name);

    expect(input?.toString()).toContain(name);
    expect('getFields' in (input ?? {})).toBe(true);
    const fields =
      input && 'getFields' in input
        ? (input as { getFields: () => Record<string, unknown> }).getFields()
        : {};

    expect(fields).toHaveProperty('projectId');
    expect(fields).toHaveProperty('title');
    expect(fields).toHaveProperty('sourceNoteId');
  });
});
