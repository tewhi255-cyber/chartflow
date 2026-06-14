import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import config from '../config';
import logger from '../config/logger';

async function migrate() {
  const pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
    charset: 'utf8mb4',
    connectionLimit: 1,
  });

  try {
    const schemaPath = path.join(__dirname, '../../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schema);
    logger.info('Database migration completed successfully');
  } catch (error) {
    logger.error('Database migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();