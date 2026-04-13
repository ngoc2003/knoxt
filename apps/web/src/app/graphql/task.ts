import { gql } from "@apollo/client";

export const TASKS_QUERY = gql`
  query Tasks($filter: TaskFilterInput, $pagination: PaginationInput) {
    tasks(filter: $filter, pagination: $pagination) {
      items {
        id
        title
        tags
        priority
        time
        status
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
