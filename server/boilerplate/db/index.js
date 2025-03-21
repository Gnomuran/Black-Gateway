import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

pg.types.setTypeParser(1082, (value) => value);

const pool = new pg.Pool();

const query = (text, params) => pool.query(text, params);

export { query, pool };
