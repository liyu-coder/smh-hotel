const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'hotelran_smh_hotel_prod',
  user: process.env.DB_USER || 'hotelran_smh_hotel',
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

  converted = converted.replace(/\$\d+/g, () => '?');
  converted = converted.replace(/\s+RETURNING\s+\*/gi, '');
  converted = converted.replace(/::[a-zA-Z0-9_]+(\([^)]*\))?/g, '');
  converted = converted.replace(/\s+ILIKE\s+/gi, ' LIKE ');
  converted = converted.replace(/= ANY\(\?\)/gi, 'IN (?)');
  converted = converted.replace(/= ANY\(\$1\)/gi, 'IN (?)');

  return converted;
}

// Query helper function
const query = async (text, params) => {
  const start = Date.now();

  try {
    const isInsert = text.trim().toUpperCase().startsWith('INSERT');
    const hasReturning = /RETURNING\s+/i.test(text);

    const mysqlQuery = convertPostgresToMySQL(text);

    console.log('Debug SQL:', mysqlQuery);
    console.log('Debug Params count:', params?.length || 0);

    const safeParams = params || [];

    const [result] = await pool.execute(mysqlQuery, safeParams);

    let rows = result;
    let rowCount = Array.isArray(result) ? result.length : 0;

    // Simulate RETURNING *
    if (isInsert && hasReturning) {
      const insertId = result.insertId;

      if (insertId) {
        const tableMatch = text.match(/INSERT\s+INTO\s+(\w+)/i);
        const tableName = tableMatch ? tableMatch[1] : null;

        // ⚠️ safer fallback (no SQL injection risk reduction layer here)
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

    console.log('Executed query:', {
      duration: Date.now() - start,
      rows: rowCount
    });

    return {
      rows,
      rowCount,
      command: text.trim().split(' ')[0].toUpperCase()
    };

  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Get a client from pool (transaction support)
const getClient = async () => {
  const connection = await pool.getConnection();

  return {
    query: async (text, params) => {
      const isInsert = text.trim().toUpperCase().startsWith('INSERT');
      const hasReturning = /RETURNING\s+/i.test(text);

      const mysqlQuery = convertPostgresToMySQL(text);
      const [result] = await connection.execute(mysqlQuery, params || []);

      let rows = result;
      let rowCount = Array.isArray(result) ? result.length : 0;

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
        rows,
        rowCount,
        command: text.trim().split(' ')[0].toUpperCase()
      };
    },

    release: () => connection.release(),
    beginTransaction: async () => connection.beginTransaction(),
    commit: async () => connection.commit(),
    rollback: async () => connection.rollback()
  };
};

module.exports = {
  pool,
  query,
  getClient
};
