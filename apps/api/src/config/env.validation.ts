const REQUIRED_ENVIRONMENT_VARIABLES = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GOOGLE_CLIENT_ID',
  'CORS_ORIGIN',
  'WEB_URL',
] as const;

export function validateEnvironment(
  environment: Record<string, unknown>,
): Record<string, unknown> {
  const missingVariables = REQUIRED_ENVIRONMENT_VARIABLES.filter((variable) => {
    const value = environment[variable];

    return typeof value !== 'string' || value.trim().length === 0;
  });

  if (missingVariables.length > 0) {
    throw new Error(
      `[ENV VALIDATION] Missing required environment variables: ${missingVariables.join(', ')}`,
    );
  }

  return environment;
}
