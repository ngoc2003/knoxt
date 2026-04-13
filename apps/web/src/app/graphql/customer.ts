import { gql } from "@apollo/client";

export const CREATE_CUSTOMER_MUTATION = gql`
  mutation CreateCustomer($data: CreateCustomerInput!) {
    createCustomer(data: $data) {
      id
      name
      email
      phone
      company
      status
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_CUSTOMER_MUTATION = gql`
  mutation UpdateCustomer($id: String!, $data: UpdateCustomerInput!) {
    updateCustomer(id: $id, data: $data) {
      id
      name
      email
      phone
      company
      status
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CUSTOMER_MUTATION = gql`
  mutation DeleteCustomer($id: String!) {
    deleteCustomer(id: $id) {
      id
    }
  }
`;

export const LIST_CUSTOMERS_QUERY = gql`
  query ListCustomers(
    $filter: ListCustomersInput
    $pagination: PaginationInput
  ) {
    listCustomers(filter: $filter, pagination: $pagination) {
      items {
        id
        name
        email
        phone
        company
        status
        createdAt
        updatedAt
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

export const CUSTOMER_DETAIL_QUERY = gql`
  query CustomerDetail($id: String!) {
    customerDetail(id: $id) {
      id
      name
      email
      phone
      company
      status
      createdAt
      updatedAt
    }
  }
`;
