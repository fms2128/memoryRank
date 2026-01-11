# memoryRank

A TypeScript Node.js project with Apache AGE graph database integration.

## Overview

This project demonstrates the integration of Apache AGE (A Graph Extension for PostgreSQL) with a TypeScript/Node.js application. Apache AGE allows you to use graph database capabilities with Cypher queries (similar to Neo4j) while leveraging the reliability of PostgreSQL.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for Windows)
- npm (comes with Node.js)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` if you want to change the default database credentials or ports.

### 3. Start the PostgreSQL Database with Apache AGE

Make sure Docker Desktop is running, then:

```bash
npm run docker:up
```

This will start:
- PostgreSQL with Apache AGE on port **5455**
- pgAdmin on port **5050** (optional web-based database manager)

### 4. Run the Application

```bash
npm run dev
```

This will:
- Initialize the Apache AGE extension
- Create a test graph
- Create sample nodes (Person entities)
- Create relationships between nodes
- Run example queries showing graph capabilities

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run the application in development mode with ts-node |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run the compiled JavaScript application |
| `npm run watch` | Watch for TypeScript changes and recompile |
| `npm run docker:up` | Start PostgreSQL and pgAdmin containers |
| `npm run docker:down` | Stop and remove containers |
| `npm run docker:logs` | View PostgreSQL container logs |
| `npm run docker:restart` | Restart the database container |

## Project Structure

```
memoryRank/
├── src/
│   ├── database/
│   │   ├── config.ts       # Database connection pool configuration
│   │   ├── age.ts          # Apache AGE helper functions
│   │   └── index.ts        # Database module exports
│   └── index.ts            # Application entry point with examples
├── docker-compose.yml      # Docker configuration for PostgreSQL + AGE
├── .env                    # Environment variables (not in git)
├── .env.example           # Environment variables template
├── package.json           # Project dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

## Using Apache AGE

### Initialize AGE

```typescript
import { initializeAGE } from './database';

await initializeAGE();
```

### Create a Graph

```typescript
import { createGraph } from './database';

await createGraph('my_graph');
```

### Execute Cypher Queries

```typescript
import { executeGraphQuery } from './database';

// Create nodes
await executeGraphQuery(
  'my_graph',
  `CREATE (:Person {name: 'Alice', age: 30})`,
  'result agtype'
);

// Query nodes
const results = await executeGraphQuery(
  'my_graph',
  `MATCH (p:Person) RETURN p.name AS name, p.age AS age`,
  'name agtype, age agtype'
);
```

### Create Relationships

```typescript
await executeGraphQuery(
  'my_graph',
  `MATCH (a:Person {name: 'Alice'}), (b:Person {name: 'Bob'})
   CREATE (a)-[:KNOWS]->(b)`,
  'result agtype'
);
```

### Path Queries

```typescript
const paths = await executeGraphQuery(
  'my_graph',
  `MATCH path = (a:Person)-[:KNOWS*1..3]->(b:Person)
   RETURN a.name AS from, b.name AS to`,
  'from agtype, to agtype'
);
```

## pgAdmin Access

Access the web-based database manager at:

- URL: http://localhost:5050
- Email: admin@admin.com
- Password: admin

**To connect to the database in pgAdmin:**

1. Right-click "Servers" → "Register" → "Server"
2. General tab:
   - Name: `Apache AGE`
3. Connection tab:
   - Host: `postgres-age` (container name)
   - Port: `5432`
   - Database: `age_db`
   - Username: `postgres`
   - Password: `password`

## Database Functions

The project includes these helper functions:

| Function | Description |
|----------|-------------|
| `initializeAGE()` | Initialize the Apache AGE extension |
| `createGraph(name)` | Create a new graph |
| `dropGraph(name)` | Delete a graph and all its data |
| `executeGraphQuery(graph, cypher, columns)` | Execute a Cypher query |
| `listGraphs()` | Get all graphs in the database |

## Cypher Query Language

Apache AGE uses Cypher, a declarative graph query language. Here are some common patterns:

### Create Nodes
```cypher
CREATE (:Label {property: 'value'})
```

### Match Nodes
```cypher
MATCH (n:Label)
RETURN n
```

### Create Relationships
```cypher
MATCH (a:Person), (b:Person)
WHERE a.name = 'Alice' AND b.name = 'Bob'
CREATE (a)-[:KNOWS]->(b)
```

### Path Traversal
```cypher
MATCH path = (a)-[:RELATIONSHIP*1..3]->(b)
RETURN path
```

## Stopping the Database

To stop the database containers:

```bash
npm run docker:down
```

Your data will be preserved in Docker volumes. To completely remove all data, run:

```bash
docker-compose down -v
```

## Troubleshooting

### Container Won't Start

1. Make sure Docker Desktop is running
2. Check if port 5455 is available: `netstat -an | findstr 5455`
3. View logs: `npm run docker:logs`

### Connection Errors

1. Ensure the database container is running: `docker ps`
2. Check environment variables in `.env`
3. Verify the host is `127.0.0.1` and port is `5455`

### AGE Extension Not Found

Make sure to call `initializeAGE()` before using any graph functions. Every new connection needs to load the AGE extension.

## Resources

- [Apache AGE Documentation](https://age.apache.org/)
- [Apache AGE GitHub](https://github.com/apache/age)
- [Cypher Query Language Guide](https://age.apache.org/age-manual/master/intro/cypher.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## License

ISC
