import type { GraphQLFormattedError } from 'graphql';
import { formatGraphQLError } from './format-error';

function createError(
  statusCode: number,
  message: string | string[],
): GraphQLFormattedError {
  return {
    message: 'Request failed',
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
      originalError: { statusCode, message },
    },
  };
}

describe('formatGraphQLError', () => {
  it('maps HTTP status codes to stable error codes', () => {
    const error = formatGraphQLError(createError(409, 'Email already in use'));

    expect(error.extensions).toMatchObject({
      code: 'CONFLICT',
      userMessage: 'Email already in use',
    });
  });

  it('joins validation messages for the client', () => {
    const error = formatGraphQLError(
      createError(400, ['Email is invalid', 'Password is too short']),
    );

    expect(error.extensions).toMatchObject({
      code: 'BAD_USER_INPUT',
      userMessage: 'Email is invalid, Password is too short',
    });
  });

  it('hides unexpected internal error messages', () => {
    const error = formatGraphQLError({
      message: 'Database connection details',
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });

    expect(error.extensions).toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
      userMessage: 'Something went wrong. Please try again.',
    });
  });
});
