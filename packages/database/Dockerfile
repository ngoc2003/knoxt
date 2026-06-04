# Use the official PostgreSQL image
FROM postgres:15-alpine

# Set environment variables for the database
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=admin
ENV POSTGRES_DB=freelancer_notebook

# Copy the Prisma schema and migrations
COPY prisma /docker-entrypoint-initdb.d/prisma

# Expose the default PostgreSQL port
EXPOSE 5432