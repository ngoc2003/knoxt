import { randomUUID } from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';
import { Options } from 'pino-http';

const REDACTED_VALUE = '[REDACTED]';

function getRequestId(request: IncomingMessage): string {
  if (typeof request.id === 'string') return request.id;
  if (typeof request.id === 'number') return request.id.toString();
  return JSON.stringify(request.id) ?? '';
}

function getPath(request: IncomingMessage): string {
  return request.url?.split('?')[0] ?? '';
}

function getDuration(value: unknown): number {
  if (
    typeof value === 'object' &&
    value !== null &&
    'responseTime' in value &&
    typeof value.responseTime === 'number'
  ) {
    return value.responseTime;
  }

  return 0;
}

function getRequestLog(
  request: IncomingMessage,
  response: ServerResponse,
  duration: number,
) {
  return {
    requestId: getRequestId(request),
    method: request.method,
    path: getPath(request),
    statusCode: response.statusCode,
    duration,
  };
}

export function createHttpLoggerOptions(
  nodeEnvironment: string,
  stream?: Options['stream'],
): Options {
  return {
    stream,
    level: nodeEnvironment === 'production' ? 'info' : 'debug',
    transport:
      nodeEnvironment === 'development' && !stream
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
              translateTime: 'SYS:standard',
            },
          }
        : undefined,
    quietReqLogger: true,
    quietResLogger: true,
    customAttributeKeys: {
      reqId: 'requestId',
    },
    genReqId: (request, response) => {
      const header = request.headers['x-request-id'];
      const incomingRequestId = Array.isArray(header) ? header[0] : header;
      const requestId = incomingRequestId?.trim() || randomUUID();

      response.setHeader('x-request-id', requestId);
      return requestId;
    },
    customLogLevel: (_request, response, error) => {
      if (error || response.statusCode >= 500) return 'error';
      if (response.statusCode >= 400) return 'warn';
      return 'info';
    },
    customSuccessObject: (request, response, value) =>
      getRequestLog(request, response, getDuration(value)),
    customErrorObject: (request, response, _error, value) =>
      getRequestLog(request, response, getDuration(value)),
    customSuccessMessage: () => 'request completed',
    customErrorMessage: () => 'request failed',
    redact: {
      paths: [
        'authorization',
        'cookie',
        'jwt',
        'password',
        'token',
        'accessToken',
        'refreshToken',
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers["set-cookie"]',
        'res.headers["set-cookie"]',
        '*.authorization',
        '*.password',
        '*.token',
        '*.jwt',
        '*.cookie',
        '*.accessToken',
        '*.refreshToken',
      ],
      censor: REDACTED_VALUE,
    },
  };
}
