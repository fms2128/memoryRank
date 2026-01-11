import { pool } from './config';
import { PoolClient } from 'pg';

/**
 * Initialize Apache AGE extension
 * This must be called before using any AGE features
 */
export async function initializeAGE(): Promise<void> {
  const client = await pool.connect();
  try {
    // Create AGE extension if it doesn't exist
    await client.query('CREATE EXTENSION IF NOT EXISTS age;');

    // Load AGE into the current session
    await client.query("LOAD 'age';");

    // Set search path to include ag_catalog
    await client.query('SET search_path = ag_catalog, "$user", public;');

    console.log('Apache AGE extension initialized successfully');
  } catch (err) {
    console.error('Error initializing AGE:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Create a new graph
 * @param graphName - Name of the graph to create
 */
export async function createGraph(graphName: string): Promise<void> {
  const client = await pool.connect();
  try {
    // Load AGE for this connection
    await client.query("LOAD 'age';");
    await client.query('SET search_path = ag_catalog, "$user", public;');

    // Check if graph already exists
    const checkQuery = `
      SELECT * FROM ag_catalog.ag_graph
      WHERE name = $1;
    `;
    const checkResult = await client.query(checkQuery, [graphName]);

    if (checkResult.rows.length > 0) {
      console.log(`Graph '${graphName}' already exists`);
      return;
    }

    // Create the graph
    await client.query(`SELECT create_graph('${graphName}');`);
    console.log(`Graph '${graphName}' created successfully`);
  } catch (err) {
    console.error(`Error creating graph '${graphName}':`, err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Drop a graph and all its data
 * @param graphName - Name of the graph to drop
 * @param cascade - Whether to cascade the drop (default: true)
 */
export async function dropGraph(graphName: string, cascade: boolean = true): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("LOAD 'age';");
    await client.query('SET search_path = ag_catalog, "$user", public;');

    const cascadeStr = cascade ? ', true' : '';
    await client.query(`SELECT drop_graph('${graphName}'${cascadeStr});`);
    console.log(`Graph '${graphName}' dropped successfully`);
  } catch (err) {
    console.error(`Error dropping graph '${graphName}':`, err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Execute a Cypher query on a graph
 * @param graphName - Name of the graph to query
 * @param cypherQuery - Cypher query to execute
 * @param resultColumns - Expected result columns (e.g., "name agtype, age agtype")
 * @returns Query results
 */
export async function executeGraphQuery(
  graphName: string,
  cypherQuery: string,
  resultColumns: string = 'result agtype'
): Promise<any[]> {
  const client = await pool.connect();
  try {
    // Load AGE for this connection
    await client.query("LOAD 'age';");
    await client.query('SET search_path = ag_catalog, "$user", public;');

    // Wrap Cypher query in SQL
    const sqlQuery = `
      SELECT * FROM cypher('${graphName}', $$
        ${cypherQuery}
      $$) AS (${resultColumns});
    `;

    const result = await client.query(sqlQuery);
    return result.rows;
  } catch (err) {
    console.error('Error executing Cypher query:', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Execute a raw AGE query with a pre-configured client
 * This is useful for transactions or batch operations
 * @param client - PostgreSQL client
 * @param graphName - Name of the graph to query
 * @param cypherQuery - Cypher query to execute
 * @param resultColumns - Expected result columns
 * @returns Query results
 */
export async function executeGraphQueryWithClient(
  client: PoolClient,
  graphName: string,
  cypherQuery: string,
  resultColumns: string = 'result agtype'
): Promise<any[]> {
  try {
    const sqlQuery = `
      SELECT * FROM cypher('${graphName}', $$
        ${cypherQuery}
      $$) AS (${resultColumns});
    `;

    const result = await client.query(sqlQuery);
    return result.rows;
  } catch (err) {
    console.error('Error executing Cypher query:', err);
    throw err;
  }
}

/**
 * Get all graphs in the database
 * @returns List of graph names
 */
export async function listGraphs(): Promise<string[]> {
  const client = await pool.connect();
  try {
    await client.query("LOAD 'age';");
    await client.query('SET search_path = ag_catalog, "$user", public;');

    const result = await client.query('SELECT name FROM ag_catalog.ag_graph;');
    return result.rows.map(row => row.name);
  } catch (err) {
    console.error('Error listing graphs:', err);
    throw err;
  } finally {
    client.release();
  }
}
