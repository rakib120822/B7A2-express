import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
  connectionString: config.connecting_string,
});

export const initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(20) DEFAULT 'contributor',
            create_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            `);

    await pool.query(`
      
      CREATE TABLE IF NOT EXISTS issues(
      id SERIAL PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      description TEXT NOT NULL,
      type VARCHAR(20) NOT NULL,
      status VARCHAR(20) DEFAULT 'open',
      reported_id  INT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
      )
      `);

    console.log("Database is connected successfully");
  } catch (error) {
    console.log("from initDB : ", { error });
  }
};
