import { gql } from "@apollo/client";

export const CREATE_INCOME_MUTATION = gql`
  mutation CreateIncome($data: CreateIncomeInput!) {
    createIncome(data: $data) {
      id
      amount
      currency
      customerId
      status
      note
      createdAt
      updatedAt
    }
  }
`;
