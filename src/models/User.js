const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(email, username, password, verificationToken, tokenExpires) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (email, username, password, verification_token, verification_token_expires)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, username, is_verified, created_at;
    `;

    const result = await pool.query(query, [
      email,
      username,
      hashedPassword,
      verificationToken,
      tokenExpires,
    ]);

    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1;';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, email, username, is_verified, created_at FROM users WHERE id = $1;';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByVerificationToken(token) {
    const query = `
      SELECT * FROM users 
      WHERE verification_token = $1 
      AND verification_token_expires > NOW();
    `;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  static async verifyEmail(userId) {
    const query = `
      UPDATE users 
      SET is_verified = true, verification_token = NULL, verification_token_expires = NULL
      WHERE id = $1
      RETURNING id, email, username, is_verified;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async getUserWithPassword(email) {
    const query = 'SELECT * FROM users WHERE email = $1;';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }
}

module.exports = User;
