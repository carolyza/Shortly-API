import bcrypt from "bcrypt";
import { connection } from "../database.js";
import { v4 as uuid } from "uuid";
import userSchema from "../schemas/userSchema.js";

export async function createUrl(req, res) {
  const { url } = req.body;
  const authorization = req.headers.authorization;
  const token = authorization.replace("Bearer ", "");

  try {
    const { rows } = await connection.query(
      `
            SELECT "userId" FROM sessions WHERE token=$1
        `,
      [token]
    );

    if (userSchema.rowCount === 0) {
      return res.sendStatus(404);
    }
    const { userId } = rows[0];

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
  let offset = "";
  let limit = "";

  if (req.query.offset) {
    offset = req.query.offset;
  }
  if (req.query.limit) {
    limit = req.query.limit;
  }

  try {
    const result = await connection.query(
      'SELECT s.id, s."shortUrl", s.url FROM "shortUrls" s WHERE "shortUrl"=$1',
      [shortUrl]
    );
    if (result.rowCount === 0) {
      return res.sendStatus(404);
    }
    res.status(200).send(result.rows[0]);
  } catch (error) {
    res.status(500).send(error);
  }
}

export async function deleteUrl(req, res) {
  const { id } = req.params;

  try {
    const selected = await connection.query(
      "SELECT id FROM shortUrl WHERE id=$1",
      [id]
    );
    if (selected.rowCount === 0) {
      return res.sendStatus(401);
    }

    await connection.query("DELETE shortUrl WHERE id=$1", [id]);
    res.sendStatus(204);
  } catch (error) {
    res.sendStatus(500).send(error);
  }
}
