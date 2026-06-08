/// <reference types="jest" />

import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  const productionEnvironment = {
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://user:password@localhost:5432/database',
    JWT_SECRET: 'secret',
    CORS_ORIGIN: 'https://app.example.com',
    WEB_URL: 'https://app.example.com',
  };

  it('accepts configuration when all required variables exist', () => {
    expect(validateEnvironment(productionEnvironment)).toBe(
      productionEnvironment,
    );
  });

  it('rejects configuration with missing or empty variables', () => {
    expect(() =>
      validateEnvironment({
        ...productionEnvironment,
        DATABASE_URL: undefined,
        JWT_SECRET: ' ',
        CORS_ORIGIN: '',
      }),
    ).toThrow(
      '[ENV VALIDATION] Missing required environment variables: DATABASE_URL, JWT_SECRET, CORS_ORIGIN',
    );
  });

  it('rejects missing required variables in development', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'development' })).toThrow(
      '[ENV VALIDATION] Missing required environment variables: DATABASE_URL, JWT_SECRET, CORS_ORIGIN, WEB_URL',
    );
  });
});
