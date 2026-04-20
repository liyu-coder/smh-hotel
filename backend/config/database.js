const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'smh_hotel_reservation',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
});

// Test database connection
pool.getConnection()
  .then(connection => {
    console.log('Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('Failed to connect to MySQL database:', err);
  });

// Convert PostgreSQL syntax to MySQL syntax
function convertPostgresToMySQL(sql) {
  let converted = sql;
  
  // Convert $1, $2, $n parameters to ? placeholders
  converted = converted.replace(/\$\d+/g, () => '?');
  
  // Remove RETURNING * (MySQL doesn't support this, use LAST_INSERT_ID() instead)
  converted = converted.replace(/\s+RETURNING\s+\*/gi, '');
  
  // Remove ::numeric, ::integer, ::text, etc. casting
  converted = converted.replace(/::[a-zA-Z0-9_]+(\([^)]*\))?/g, '');
  
  // Convert ILIKE to LIKE (MySQL is case-insensitive by default with proper collation)
  converted = converted.replace(/\s+ILIKE\s+/gi, ' LIKE ');
  
  // Convert NOW() - both support it, but ensure compatibility
  // NOW() is the same in both
  
  return converted;
}

// Query helper function
const query = async (text, params) => {
  const start = Date.now();
  try {
    const isInsert = text.trim().toUpperCase().startsWith('INSERT');
    const hasReturning = /RETURNING\s+\*/i.test(text);
    
    // Convert PostgreSQL syntax to MySQL
    const mysqlQuery = convertPostgresToMySQL(text);
    const [result] = await pool.execute(mysqlQuery, params);
    const duration = Date.now() - start;
    
    let rows = result;
    let rowCount = Array.isArray(result) ? result.length : 0;
    
    // For INSERT with RETURNING, fetch the inserted row
    if (isInsert && hasReturning) {
      const insertId = result.insertId;
      if (insertId) {
        // Extract table name from INSERT INTO table_name
        const tableMatch = text.match(/INSERT\s+INTO\s+(\w+)/i);
        const tableName = tableMatch ? tableMatch[1] : null;
        
        if (tableName) {
          const [insertedRows] = await pool.execute(
            `SELECT * FROM ${tableName} WHERE id = ?`,
            [insertId]
          );
          rows = insertedRows;
          rowCount = insertedRows.length;
        }
      }
    }
    
    console.log('Executed query', { text: mysqlQuery.substring(0, 100), duration, rows: rowCount });
    
    // Return in PostgreSQL-compatible format for minimal code changes
    return {
      rows: rows,
      rowCount: rowCount,
      command: text.trim().split(' ')[0].toUpperCase()
    };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get a client from the pool for transactions
const getClient = async () => {
  const connection = await pool.getConnection();
  
  // Wrap connection to match PostgreSQL client interface
  return {
    query: async (text, params) => {
      const isInsert = text.trim().toUpperCase().startsWith('INSERT');
      const hasReturning = /RETURNING\s+\*/i.test(text);
      
      const mysqlQuery = convertPostgresToMySQL(text);
      const [result] = await connection.execute(mysqlQuery, params);
      
      let rows = result;
      let rowCount = Array.isArray(result) ? result.length : 0;
      
      // For INSERT with RETURNING, fetch the inserted row
      if (isInsert && hasReturning) {
        const insertId = result.insertId;
        if (insertId) {
          const tableMatch = text.match(/INSERT\s+INTO\s+(\w+)/i);
          const tableName = tableMatch ? tableMatch[1] : null;
          
          if (tableName) {
            const [insertedRows] = await connection.execute(
              `SELECT * FROM ${tableName} WHERE id = ?`,
              [insertId]
            );
            rows = insertedRows;
            rowCount = insertedRows.length;
          }
        }
      }
      
      return {
        rows: rows,
        rowCount: rowCount,
        command: text.trim().split(' ')[0].toUpperCase()
      };
    },
    release: () => connection.release(),
    beginTransaction: () => connection.beginTransaction(),
    commit: () => connection.commit(),
    rollback: () => connection.rollback()
  };
};

module.exports = {
  pool,
  query,
  getClient
};
