// Import the MySQL module
const mysql = require('mysql');

// Create a connection to the database
const connection = mysql.createConnection({
  host: 'localhost', // e.g., 'localhost'
  user: 'root', // e.g., 'root'
  password: 'localroot',
  database: 'twilio_db_local_production'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database as ID', connection.threadId);
});

// Define the query to fetch distinct call durations and company IDs
const query = `
SELECT CompanyId, MAX(CallDurations) AS CallDurations
FROM CallsystemCdr
GROUP BY CompanyId
ORDER BY CompanyId;
`;

// Execute the query
connection.query(query, (error, results, fields) => {
  if (error) {
    console.error('Error executing query:', error.stack);
    return;
  }
  
  // Log the results to the console
  console.log('Distinct call durations by company ID:');
  results.forEach((row) => {
    console.log(`CompanyId: ${row.CompanyId}, CallDurations: ${row.CallDurations}`);
  });
});

// Close the connection
connection.end();
