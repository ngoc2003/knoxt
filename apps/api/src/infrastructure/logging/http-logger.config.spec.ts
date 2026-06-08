import { createServer } from 'http';
import { Writable } from 'stream';
import pinoHttp from 'pino-http';
import request from 'supertest';
import { createHttpLoggerOptions } from './http-logger.config';

describe('HTTP logger', () => {
  function createTestServer() {
    const output: string[] = [];
    const stream = new Writable({
      write(chunk: Buffer, _encoding, callback) {
        output.push(chunk.toString());
        callback();
      },
    });
    const logger = pinoHttp(createHttpLoggerOptions('production', stream));
    const server = createServer((incomingRequest, response) => {
      logger(incomingRequest, response);
      incomingRequest.log.info(
        { password: 'body-secret', token: 'token-secret' },
        'request handler log',
      );
      response.end('ok');
    });

    return { output, server };
  }

  function parseLogs(output: string[]) {
    return output.map((line) => JSON.parse(line) as Record<string, unknown>);
  }

  it('uses an incoming request ID in the response and structured log', async () => {
    const { output, server } = createTestServer();

    const response = await request(server)
      .get('/health/live?password=query-secret')
      .set('x-request-id', 'client-request-id')
      .set('authorization', 'Bearer jwt-secret')
      .set('cookie', 'session=cookie-secret')
      .expect(200);

    const logs = parseLogs(output);
    const completionLog = logs.find((log) => log.msg === 'request completed');

    expect(response.headers['x-request-id']).toBe('client-request-id');
    expect(completionLog).toMatchObject({
      requestId: 'client-request-id',
      method: 'GET',
      path: '/health/live',
      statusCode: 200,
    });
    expect(completionLog?.duration).toEqual(expect.any(Number));
    expect(output.join('')).not.toContain('query-secret');
    expect(output.join('')).not.toContain('jwt-secret');
    expect(output.join('')).not.toContain('cookie-secret');
    expect(output.join('')).not.toContain('body-secret');
    expect(output.join('')).not.toContain('token-secret');
  });

  it('generates a UUID when the request has no ID', async () => {
    const { output, server } = createTestServer();

    const response = await request(server).get('/health/live').expect(200);
    const requestId = response.headers['x-request-id'];
    const completionLog = parseLogs(output).find(
      (log) => log.msg === 'request completed',
    );

    expect(requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(completionLog?.requestId).toBe(requestId);
  });

  it('uses pretty output only in development', () => {
    expect(createHttpLoggerOptions('development').transport).toMatchObject({
      target: 'pino-pretty',
    });
    expect(createHttpLoggerOptions('production').transport).toBeUndefined();
  });
});
