import { pool } from "../../db";

// create issues
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

// get all issues

const getAllIssues = async (
  type: string,
  sort: string = "newest",
  status: string,
) => {
  try {
    const result = await pool.query(`
    SELECT * FROM issues 
  `);
    let issues = await Promise.all(
      result.rows.map(async (issue) => {
        // console.log("issue reported_id")
        const userData = await pool.query(
          `
        SELECT name, id, role
        FROM users
        WHERE id = $1
        `,
          [issue.reported_id], // or reported_id depending on your schema
        );

        const user = userData.rows[0];
        // console.log("user : ", userData);

        return {
          ...issue,
          reporter: user
            ? {
                id: user.id,
                name: user.name,
                role: user.role,
              }
            : null,
        };
      }),
    );

    if (type) {
      issues = issues.filter((issue) => issue.type == type);
    }

    if (status) {
      issues = issues.filter((issue) => issue.status == status);
    }

    if (sort) {
      if (sort == "newest") {
        issues.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
      } else {
        issues.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      }
    }
    return issues;
  } catch (error: any) {
    throw new Error("issue Service logic error");
  }
};

const getIssueById = async (id: number) => {
  try {
    const result = await pool.query(
      `
    
    SELECT * FROM issues WHERE id=$1
    
    `,
      [id],
    );
    const issue = result.rows[0];
    const userData = await pool.query(
      `
      
      SELECT name,id,role FROM users WHERE id=$1
      
      `,
      [issue.reported_id],
    );
    const user = userData.rows[0];
    issue.reporter = user;
    return issue;
  } catch (error: any) {
    throw new Error("issue Service logic error");
  }
};

const issueService = {
  createIssues,
  getAllIssues,
  getIssueById,
};

export default issueService;
