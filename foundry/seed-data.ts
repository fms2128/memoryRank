import { initializeAGE, createGraph, executeGraphQuery, pool } from '../src/database';

/**
 * Seed script to populate the graph database with initial data
 */
async function seedData() {
  try {
    console.log('=== Starting Data Seeding ===\n');

    // Initialize Apache AGE extension
    console.log('1. Initializing Apache AGE extension...');
    await initializeAGE();
    console.log('   ✓ AGE initialized\n');

    // Create a graph
    const graphName = 'memory_graph';
    console.log(`2. Creating graph: ${graphName}...`);
    await createGraph(graphName);
    console.log('   ✓ Graph created\n');

    // Create some nodes
    console.log('3. Creating nodes (Person entities)...');
    await executeGraphQuery(
      graphName,
      `CREATE (:Person {name: 'Alice', age: 30, occupation: 'Engineer'}),
              (:Person {name: 'Bob', age: 28, occupation: 'Designer'}),
              (:Person {name: 'Charlie', age: 32, occupation: 'Manager'})`,
      'result agtype'
    );
    console.log('   ✓ Nodes created\n');

    // Create relationships
    console.log('4. Creating relationships (KNOWS)...');
    await executeGraphQuery(
      graphName,
      `MATCH (a:Person {name: 'Alice'}), (b:Person {name: 'Bob'})
       CREATE (a)-[:KNOWS {since: 2020}]->(b)`,
      'result agtype'
    );
    await executeGraphQuery(
      graphName,
      `MATCH (b:Person {name: 'Bob'}), (c:Person {name: 'Charlie'})
       CREATE (b)-[:KNOWS {since: 2019}]->(c)`,
      'result agtype'
    );
    console.log('   ✓ Relationships created\n');

    // Verify data
    console.log('5. Verifying seeded data...');
    const persons = await executeGraphQuery(
      graphName,
      `MATCH (p:Person)
       RETURN p.name AS name, p.age AS age, p.occupation AS occupation
       ORDER BY p.name`,
      'name agtype, age agtype, occupation agtype'
    );
    console.log(`   ✓ ${persons.length} persons created:`);
    persons.forEach(person => {
      console.log(`      - ${person.name}: ${person.age} years old, ${person.occupation}`);
    });
    console.log();

    console.log('=== Data Seeding Completed Successfully! ===\n');

  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('Database connection closed.');
  }
}

// Run the seed function
seedData();
