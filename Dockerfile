# Use a Node.js base image
FROM node:18

# Install PostgreSQL
RUN apt-get update && apt-get install -y postgresql postgresql-contrib

# Set up the working directory
WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy the application source code
COPY . .

# Build TypeScript code
RUN npm run build

# Set up PostgreSQL with a default user and database
RUN service postgresql start && \
    su - postgres -c "psql -c \"CREATE USER postgres WITH PASSWORD 'postgres';\"" && \
    su - postgres -c "psql -c \"CREATE DATABASE mydatabase OWNER postgres;\""

# Expose the ports for Express and PostgreSQL
EXPOSE 3000 5432

# Start both PostgreSQL and the Node.js app in one command
CMD service postgresql start && node dist/server.js
