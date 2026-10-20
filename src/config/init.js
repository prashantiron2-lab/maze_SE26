const pool = require('./database');

const initializeDatabase = async () => {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_verified BOOLEAN DEFAULT false,
        verification_token VARCHAR(255),
        verification_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_verification_token ON users(verification_token);
    `;

    await pool.query(createTableQuery);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

module.exports = initializeDatabase;
