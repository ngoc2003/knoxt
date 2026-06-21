import { gql } from "@apollo/client";

export const PROJECT_KNOWLEDGE_QUERY = gql`
  query ProjectKnowledge(
    $projectId: String!
    $filter: StructuredFilterInput
    $pagination: PaginationInput
  ) {
    decisions(projectId: $projectId, filter: $filter, pagination: $pagination) {
      items {
        id
        projectId
        sourceNoteId
        title
        description
        reason
        impact
        decidedAt
        status
        createdAt
        updatedAt
        deletedAt
      }
      total
      hasMore
    }
    meetings(projectId: $projectId, filter: $filter, pagination: $pagination) {
      items {
        id
        projectId
        sourceNoteId
        title
        scheduledAt
        summary
        recordingUrl
        status
        createdAt
        updatedAt
        deletedAt
        participants {
          id
          userId
          externalName
          externalEmail
          user {
            id
            name
            email
            avatarUrl
          }
        }
        actionItems {
          id
          meetingId
          title
          description
          assigneeId
          externalAssigneeName
          dueDate
          status
          promotedTaskId
          assignee {
            id
            name
            email
          }
          promotedTask {
            id
            title
            status
          }
        }
      }
      total
      hasMore
    }
    requirements(
      projectId: $projectId
      filter: $filter
      pagination: $pagination
    ) {
      items {
        id
        projectId
        sourceNoteId
        title
        description
        priority
        status
        createdAt
        updatedAt
        deletedAt
      }
      total
      hasMore
    }
  }
`;

export const CREATE_DECISION = gql`
  mutation CreateDecision($data: CreateDecisionInput!) {
    createDecision(data: $data) {
      id
    }
  }
`;
export const UPDATE_DECISION = gql`
  mutation UpdateDecision($id: String!, $data: UpdateDecisionInput!) {
    updateDecision(id: $id, data: $data) {
      id
    }
  }
`;
export const DELETE_DECISION = gql`
  mutation DeleteDecision($id: String!) {
    deleteDecision(id: $id) {
      id
    }
  }
`;
export const RESTORE_DECISION = gql`
  mutation RestoreDecision($id: String!) {
    restoreDecision(id: $id) {
      id
    }
  }
`;

export const CREATE_MEETING = gql`
  mutation CreateMeeting($data: CreateMeetingInput!) {
    createMeeting(data: $data) {
      id
    }
  }
`;
export const UPDATE_MEETING = gql`
  mutation UpdateMeeting($id: String!, $data: UpdateMeetingInput!) {
    updateMeeting(id: $id, data: $data) {
      id
    }
  }
`;
export const DELETE_MEETING = gql`
  mutation DeleteMeeting($id: String!) {
    deleteMeeting(id: $id) {
      id
    }
  }
`;
export const RESTORE_MEETING = gql`
  mutation RestoreMeeting($id: String!) {
    restoreMeeting(id: $id) {
      id
    }
  }
`;
export const ADD_MEETING_PARTICIPANT = gql`
  mutation AddMeetingParticipant($data: AddMeetingParticipantInput!) {
    addMeetingParticipant(data: $data) {
      id
    }
  }
`;
export const REMOVE_MEETING_PARTICIPANT = gql`
  mutation RemoveMeetingParticipant($id: String!) {
    removeMeetingParticipant(id: $id) {
      id
    }
  }
`;
export const CREATE_ACTION_ITEM = gql`
  mutation CreateActionItem($data: CreateActionItemInput!) {
    createActionItem(data: $data) {
      id
    }
  }
`;
export const UPDATE_ACTION_ITEM = gql`
  mutation UpdateActionItem($id: String!, $data: UpdateActionItemInput!) {
    updateActionItem(id: $id, data: $data) {
      id
    }
  }
`;
export const DELETE_ACTION_ITEM = gql`
  mutation DeleteActionItem($id: String!) {
    deleteActionItem(id: $id) {
      id
    }
  }
`;
export const RESTORE_ACTION_ITEM = gql`
  mutation RestoreActionItem($id: String!) {
    restoreActionItem(id: $id) {
      id
    }
  }
`;
export const PROMOTE_ACTION_ITEM = gql`
  mutation PromoteActionItem($id: String!) {
    promoteActionItem(id: $id) {
      id
      title
      description
      priority
      status
      orderKey
      dueDate
      projectId
      assigneeId
      assignee {
        id
        name
        email
      }
      tags {
        id
        name
        color
      }
    }
  }
`;

export const CREATE_REQUIREMENT = gql`
  mutation CreateRequirement($data: CreateRequirementInput!) {
    createRequirement(data: $data) {
      id
    }
  }
`;
export const UPDATE_REQUIREMENT = gql`
  mutation UpdateRequirement($id: String!, $data: UpdateRequirementInput!) {
    updateRequirement(id: $id, data: $data) {
      id
    }
  }
`;
export const DELETE_REQUIREMENT = gql`
  mutation DeleteRequirement($id: String!) {
    deleteRequirement(id: $id) {
      id
    }
  }
`;
export const RESTORE_REQUIREMENT = gql`
  mutation RestoreRequirement($id: String!) {
    restoreRequirement(id: $id) {
      id
    }
  }
`;

export const PROJECT_KNOWLEDGE_SEARCH = gql`
  query ProjectKnowledgeSearch(
    $input: ProjectKnowledgeSearchInput!
    $pagination: PaginationInput
  ) {
    projectKnowledgeSearch(input: $input, pagination: $pagination) {
      items {
        id
        projectId
        type
        title
        snippet
        status
        updatedAt
      }
      total
      hasMore
    }
  }
`;

export const PROJECT_ACTIVITY = gql`
  query ProjectActivity($projectId: String!, $pagination: PaginationInput) {
    projectActivity(projectId: $projectId, pagination: $pagination) {
      items {
        id
        userId
        projectId
        action
        entity
        entityId
        createdAt
      }
      total
      hasMore
    }
  }
`;

export const ANALYZE_MEETING_TRANSCRIPT = gql`
  mutation AnalyzeMeetingTranscript($input: AnalyzeMeetingTranscriptInput!) {
    analyzeMeetingTranscript(input: $input) {
      title
      summary
      warnings
      decisions {
        title
        description
        reason
      }
      actionItems {
        title
        description
        externalAssigneeName
        dueDate
      }
    }
  }
`;

export const SAVE_MEETING_INTELLIGENCE_DRAFT = gql`
  mutation SaveMeetingIntelligenceDraft(
    $input: SaveMeetingIntelligenceDraftInput!
  ) {
    saveMeetingIntelligenceDraft(input: $input) {
      id
      projectId
      title
      scheduledAt
      summary
      status
      createdAt
      updatedAt
      deletedAt
      participants {
        id
        userId
        externalName
        externalEmail
        user {
          id
          name
          email
          avatarUrl
        }
      }
      actionItems {
        id
        meetingId
        title
        description
        assigneeId
        externalAssigneeName
        dueDate
        status
        deletedAt
        promotedTaskId
        assignee {
          id
          name
          email
        }
        promotedTask {
          id
          title
          status
        }
      }
    }
  }
`;
