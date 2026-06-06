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
