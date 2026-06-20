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

export const BULK_MOVE_TASKS_MUTATION = gql`
  mutation BulkMoveTasks($input: BulkMoveTasksInput!) {
    bulkMoveTasks(input: $input) {
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

export const REQUEST_TASK_PROJECT_ACCESS_MUTATION = gql`
  mutation RequestTaskProjectAccess($taskId: String!) {
    requestTaskProjectAccess(taskId: $taskId)
  }
`;

export const APPROVE_TASK_PROJECT_ACCESS_MUTATION = gql`
  mutation ApproveTaskProjectAccess($projectId: String!, $requesterId: String!) {
    approveTaskProjectAccess(projectId: $projectId, requesterId: $requesterId)
  }
`;
