import { pool } from "../../db";

const createIssues = async (payload: any) => {
  const { title, description, type, email } = payload;
  const userData = await pool.query(
    `
    
    SELECT * FROM users WHERE email=$1
    
    `,
    [email],
  );

  const user = userData.rows[0];

  const result = await pool.query(
    `

        INSERT INTO issues(title,description,type,reported_id) VALUES($1,$2,$3,$4) RETURNING *

        `,
    [title, description, type, user.id],
  );

  return result.rows[0];
};

const issueService = {
  createIssues,
};

export default issueService;
