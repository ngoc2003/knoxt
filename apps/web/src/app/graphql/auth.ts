import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation Register($data: RegisterInput!) {
    register(data: $data) {
      accessToken
      user {
        id
        email
        name
        avatarUrl
        createdAt
        updatedAt
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($data: LoginInput!) {
    login(data: $data) {
      accessToken
      user {
        id
        email
        name
        avatarUrl
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_CURRENT_USER_QUERY = gql`
  query GetCurrentUser {
    me {
      id
      email
      name
      avatarUrl
      createdAt
      updatedAt
    }
  }
`;
