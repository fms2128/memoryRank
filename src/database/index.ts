// Export database connection pool
export { pool } from './config';

// Export all Apache AGE functions
export {
  initializeAGE,
  createGraph,
  dropGraph,
  executeGraphQuery,
  executeGraphQueryWithClient,
  listGraphs,
} from './age';
