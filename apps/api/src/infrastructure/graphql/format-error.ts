import type { GraphQLFormattedError } from 'graphql';

type OriginalError = {
  message?: string | string[];
  statusCode?: number;
};

const statusCodeToErrorCode: Record<number, string> = {
  400: 'BAD_USER_INPUT',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
};

export function formatGraphQLError(
  formattedError: GraphQLFormattedError,
): GraphQLFormattedError {
  const originalError = formattedError.extensions?.originalError as
    | OriginalError
    | undefined;
  const statusCode = originalError?.statusCode;
  const code =
    (statusCode && statusCodeToErrorCode[statusCode]) ||
    formattedError.extensions?.code ||
    'INTERNAL_SERVER_ERROR';

  const originalMessage = originalError?.message;
  const userMessage =
    code === 'INTERNAL_SERVER_ERROR'
      ? 'Something went wrong. Please try again.'
      : Array.isArray(originalMessage)
        ? originalMessage.join(', ')
        : originalMessage || formattedError.message;

  return {
    ...formattedError,
    extensions: {
      ...formattedError.extensions,
      code,
      userMessage,
    },
  };
}
