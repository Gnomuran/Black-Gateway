/* eslint-disable camelcase */
/* eslint-disable import/prefer-default-export */
import fs from 'fs';
import { pool } from '../../boilerplate/db/index.js';

// Helper to manage PostgreSQL large objects
export const LargeObjectManager = {
  // Store a file as a large object
  async storeFile(filePath, filename, mediaType) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Create a large object
      const loResult = await client.query('SELECT lo_create(0) AS lo_oid');
      const loOid = loResult.rows[0].lo_oid;

      // Open the large object for writing
      const loOpenResult = await client.query('SELECT lo_open($1, 131072) AS fd', [loOid]);
      const { fd } = loOpenResult.rows[0];

      // Read file and write to large object
      const fileBuffer = fs.readFileSync(filePath);
      await client.query('SELECT lo_write($1, $2) AS bytes_written', [fd, fileBuffer]);

      // Close the large object
      await client.query('SELECT lo_close($1)', [fd]);

      // Store reference in media_objects table
      const result = await client.query(
        'INSERT INTO media_objects(lo_oid, filename, media_type) VALUES($1, $2, $3) RETURNING id',
        [loOid, filename, mediaType],
      );

      await client.query('COMMIT');
      return result.rows[0].id;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Retrieve a large object
  async getObject(mediaObjectId) {
    const client = await pool.connect();

    try {
      // Get the large object OID
      const objectResult = await client.query(
        'SELECT lo_oid, filename, media_type FROM media_objects WHERE id = $1',
        [mediaObjectId],
      );

      if (objectResult.rows.length === 0) {
        throw new Error('Media object not found');
      }

      const { lo_oid, filename, media_type } = objectResult.rows[0];

      // Open the large object for reading
      await client.query('BEGIN');
      const loOpenResult = await client.query('SELECT lo_open($1, 131073) AS fd', [lo_oid]);
      const { fd } = loOpenResult.rows[0];

      // Get large object size
      const sizeResult = await client.query('SELECT lo_lseek($1, 0, 2) AS size', [fd]);
      const { size } = sizeResult.rows[0];

      // Reset position to beginning
      await client.query('SELECT lo_lseek($1, 0, 0)', [fd]);

      // Read the large object
      const dataResult = await client.query('SELECT loread($1, $2) AS data', [fd, size]);
      const { data } = dataResult.rows[0];

      // Close the large object
      await client.query('SELECT lo_close($1)', [fd]);
      await client.query('COMMIT');

      return { data, filename, media_type };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Delete a large object
  async deleteObject(mediaObjectId) {
    const client = await pool.connect();

    try {
      // Get the large object OID
      const objectResult = await client.query(
        'SELECT lo_oid FROM media_objects WHERE id = $1',
        [mediaObjectId],
      );

      if (objectResult.rows.length === 0) {
        throw new Error('Media object not found');
      }

      const loOid = objectResult.rows[0].lo_oid;

      // Delete the large object
      await client.query('BEGIN');
      await client.query('SELECT lo_unlink($1)', [loOid]);

      // Delete the reference
      await client.query('DELETE FROM media_objects WHERE id = $1', [mediaObjectId]);
      await client.query('COMMIT');

      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },
};
