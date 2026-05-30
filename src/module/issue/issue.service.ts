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
};

// get specific issue
const getIssueById = async (id: number) => {
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
};

// update issue
const updateIssue = async (
  issue_id: string,
  payload: {
    title: string;
    description: string;
    type: string;
    id: number;
    role: string;
  },
) => {
  const { title, description, type, id, role } = payload;
  const issue = await pool.query(
    `
      
      SELECT * FROM issues WHERE id=$1
      
      `,
    [issue_id],
  );
  if (issue.rowCount == 0) {
    throw new Error("issue is not found");
  }

  if (
    role == "contributor" &&
    issue.rows[0].reported_id != id &&
    issue.rows[0].status != "open"
  ) {
    throw new Error("UnAuthorized access");
  }
  const result = await pool.query(
    `
    UPDATE issues SET title=COALESCE($1,title),description=COALESCE($2,description),type=COALESCE($3,type)
    WHERE id=$4
    RETURNING *
    `,
    [title, description, type, id],
  );

  return result.rows[0];
};

const issueService = {
  createIssues,
  getAllIssues,
  getIssueById,
  updateIssue,
};

export default issueService;
