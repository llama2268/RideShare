# Use Node.js as the base image
FROM node:18

# Install PostgreSQL
RUN apt-get update && apt-get install -y postgresql postgresql-contrib

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json and install dependencies
COPY package*.json ./
RUN npm install
RUN npm rebuild bcrypt --build-from-source


# Copy the entire source code into the container
COPY . .

# Build the TypeScript code
RUN npm run build

# Set up PostgreSQL with a default user and database
RUN service postgresql start && \
    su - postgres -c "psql -tc \"SELECT 1 FROM pg_roles WHERE rolname='postgres'\" | grep -q 1 || psql -c \"CREATE USER postgres WITH PASSWORD 'postgres';\"" && \
    su - postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='mydatabase'\" | grep -q 1 || psql -c \"CREATE DATABASE mydatabase OWNER postgres;\""

RUN apt-get update && \
    apt-get install -y --no-install-recommends make gcc g++ python3 && \
    npm install && \
    npm rebuild bcrypt --build-from-source && \
    apt-get remove -y make gcc g++ python3 && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*


# Expose the ports
EXPOSE 3000 5432

# Start the application
CMD ["node", "dist/index.js"]
