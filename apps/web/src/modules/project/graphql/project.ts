import { gql } from "@apollo/client";

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($data: CreateProjectInput!) {
    createProject(data: $data) {
      id
      userId
      name
      description
      customerId
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_PROJECT_MUTATION = gql`
  mutation UpdateProject($id: String!, $data: UpdateProjectInput!) {
    updateProject(id: $id, data: $data) {
      id
      name
      description
      customerId
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_PROJECT_MUTATION = gql`
  mutation DeleteProject($id: String!) {
    deleteProject(id: $id) {
      id
    }
  }
`;

export const PROJECTS_QUERY = gql`
  query Projects($pagination: PaginationInput, $customerId: String) {
    projects(pagination: $pagination, customerId: $customerId) {
      items {
        id
        name
        description
        customerId
        createdAt
        updatedAt
        status
        customer {
          id
          name
        }
        incomes {
          id
          amount
        }
        columns {
          id
          key
          name
          orderIndex
        }
        tasks {
          id
          status
        }
      }
      total
      skip
      take
    }
  }
`;

export const PROJECT_DETAIL_QUERY = gql`
  query ProjectDetail($id: String!) {
    projectDetail(id: $id) {
      id
      userId
      name
      description
      customerId
      createdAt
      updatedAt
      status
      startDate
      endDate
      tasks {
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
          avatarUrl
        }
        tags {
          id
          name
          color
        }
      }
      columns {
        id
        key
        name
        orderIndex
      }
      incomes {
        id
        amount
      }
      customer {
        id
        name
      }
      members {
        id
        userId
        role
        user {
          id
          name
          email
          avatarUrl
        }
      }
      invitations {
        id
        email
        role
      }
    }
  }
`;

export const CREATE_PROJECT_COLUMN_MUTATION = gql`
  mutation CreateProjectColumn($data: CreateProjectColumnInput!) {
    createProjectColumn(data: $data) {
      id
      key
      name
      orderIndex
    }
  }
`;

export const REORDER_PROJECT_COLUMNS_MUTATION = gql`
  mutation ReorderProjectColumns($data: ReorderProjectColumnsInput!) {
    reorderProjectColumns(data: $data) {
      id
      key
      name
      orderIndex
    }
  }
`;

export const DELETE_PROJECT_COLUMN_MUTATION = gql`
  mutation DeleteProjectColumn($data: DeleteProjectColumnInput!) {
    deleteProjectColumn(data: $data) {
      id
    }
  }
`;

export const ADD_PROJECT_MEMBER_MUTATION = gql`
  mutation AddProjectMember($data: AddProjectMemberInput!) {
    addProjectMember(data: $data) {
      status
      emailSent
      member {
        id
        userId
        role
        user {
          id
          name
          email
        }
      }
      invitation {
        id
        email
        role
      }
    }
  }
`;

export const UPDATE_PROJECT_MEMBER_ROLE_MUTATION = gql`
  mutation UpdateProjectMemberRole($data: UpdateProjectMemberRoleInput!) {
    updateProjectMemberRole(data: $data) {
      id
      userId
      role
      user {
        id
        name
        email
      }
    }
  }
`;

export const REMOVE_PROJECT_MEMBER_MUTATION = gql`
  mutation RemoveProjectMember($data: RemoveProjectMemberInput!) {
    removeProjectMember(data: $data) {
      id
    }
  }
`;

export const CANCEL_PROJECT_INVITATION_MUTATION = gql`
  mutation CancelProjectInvitation($data: CancelProjectInvitationInput!) {
    cancelProjectInvitation(data: $data) {
      id
    }
  }
`;
