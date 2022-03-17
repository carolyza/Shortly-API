import bcrypt from "bcrypt";
import { connection } from "../database.js";
import { v4 as uuid } from "uuid";
import userSchema from "../schemas/userSchema.js";

export async function createUrl(req, res) {
  const { url } = req.body;
  const authorization = req.headers.authorization;
  const token = authorization.replace("Bearer ", "");

  try {
    const users = await connection.query(
      `
            SELECT "userId" FROM sessions WHERE token=$1
        `,
      [token]
    );

    if (userSchema.rowCount === 0) {
      return res.sendStatus(404);
    }
    const { userId } = users.rows[0];

    const shortUrl = uuid().split("-")[0];
    await connection.query(
      'INSERT INTO "shortUrls"("shortUrl",url,"userId") VALUES ($1,$2,$3)',
      [shortUrl, url, userId]
    );
    return res.status(201).send(shortUrl);
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function getUrl(req, res) {
  const { shortUrl } = req.params;

  try {
    const result = await connection.query(
      'SELECT s.id, s."shortUrl", s.url FROM "shortUrls" s WHERE "shortUrl"=$1',
      [shortUrl]
    );
    if (result.rowCount === 0) {
      return res.sendStatus(404);
    }

    const { rows } = await connection.query(
      'UPDATE "visitCount" FROM "shortUrls" WHERE "shortUrl"=$1',
      [shortUrl]
    );

    const count = rows[0].visitcount++;

    await connection.query(
      'UPDATE "shortUrls" set "visitCount"=$1 WHERE "shortUrl"=$2',
      [count, shortUrl]
    );
    res.status(200).send(result.rows[0]);
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function deleteUrl(req, res) {
  const { id } = req.params;
  const authorization = req.headers.authorization;
  const token = authorization?.replace("Bearer ", "");

  try {
    const users = await connection.query(
      'SELECT "userId" FROM sessions WHERE token=$1',
      [token]
    );
    const { userId } = users.rows[0];

    const url = await connection.query(
      `SELECT id FROM "shortUrls" WHERE id=$1 AND "userId"=$2`,
      [token]
    );

    if (url.rowCount === 0) {
      return res.sendStatus(404);
    }

    await connection.query(`DELETE FROM "shortUrl" WHERE id=$1`, [id]);
    res.sendStatus(204);
  } catch (error) {
    res.sendStatus(500).send(error);
  }
}
