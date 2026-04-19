import { gql } from "@apollo/client";

export const CREATE_PROJECT_MUTATION = gql`
  mutation CreateProject($data: CreateProjectInput!) {
    createProject(data: $data) {
      id
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
        customer {
          id
          name
        }
        incomes {
          id
          amount
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
        priority
        status
      }
      incomes {
        id
        amount
      }
      customer {
        id
        name
      }
    }
  }
`;
