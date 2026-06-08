import { gql } from "@apollo/client";

export const TASKS_QUERY = gql`
  query Tasks($filter: TaskFilterInput, $pagination: PaginationInput) {
    tasks(filter: $filter, pagination: $pagination) {
      items {
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
  }
`;

export const MOVE_TASK_MUTATION = gql`
  mutation MoveTask($input: MoveTaskInput!) {
    moveTask(input: $input) {
      id
      status
      orderKey
    }
  }
`;

export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(data: $input) {
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
    }
  }
`;

export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($id: String!, $data: UpdateTaskInput!) {
    updateTask(id: $id, data: $data) {
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
