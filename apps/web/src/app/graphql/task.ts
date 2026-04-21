import { gql } from "@apollo/client";

export const TASKS_QUERY = gql`
  query Tasks($filter: TaskFilterInput, $pagination: PaginationInput) {
    tasks(filter: $filter, pagination: $pagination) {
      items {
        id
        title
        priority
        time
        status
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
      orderIndex
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
      dueDate
      projectId
    }
  }
`;
