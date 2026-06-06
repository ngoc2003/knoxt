import { gql } from "@apollo/client";

export const NOTIFICATIONS_QUERY = gql`
  query Notifications {
    notifications {
      id
      type
      message
      read
      createdAt
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;
