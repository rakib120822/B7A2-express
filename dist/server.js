

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
var config = {
  port: process.env.PORT,
  connecting_string: process.env.DB_CONNECTING_STRING,
  access_token_secret: process.env.JWT_SECRET,
  refresh_token_secret: process.env.REFRESH_SECRET
};
var config_default = config;

// src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { StatusCodes as StatusCodes4 } from "http-status-codes";

// src/module/auth/auth.route.ts
import { Router } from "express";

// src/module/auth/auth.service.ts
import bcrypt from "bcryptjs";

// src/db/index.ts
import { Pool } from "pg";
var pool = new Pool({
  connectionString: config_default.connecting_string
});
var initDB = async () => {
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

// src/module/auth/auth.service.ts
import jwt from "jsonwebtoken";
var registerUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
    
    INSERT INTO users(name,email,password,role) VALUES($1, $2, $3, COALESCE($4,'contributor')) RETURNING *
    
    `,
    [name, email, hashPassword, role]
  );
  delete result.rows[0].password;
  return result;
};
var loginUserFromDB = async (password, email) => {
  if (!password || !email) {
    throw new Error("Credentials are required");
  }
  const userData = await pool.query(
    `
    
    SELECT * FROM users WHERE email=$1

    `,
    [email]
  );
  if (userData.rowCount == 0) {
    throw new Error("User Is not found");
  }
  const user = userData.rows[0];
  const isMatched = await bcrypt.compare(password, user.password);
  if (!isMatched) {
    throw new Error("Invalid Credential");
  }
  const JwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email
  };
  const accessToken = jwt.sign(JwtPayload, config_default.access_token_secret, {
    expiresIn: "1d"
  });
  const refreshToken2 = jwt.sign(JwtPayload, config_default.refresh_token_secret, {
    expiresIn: "10d"
  });
  delete user.password;
  return { accessToken, user, refreshToken: refreshToken2 };
};
var generateRefreshToken = async (token) => {
  if (!token) {
    throw new Error("Unauthorized access");
  }
  const decoded = jwt.verify(token, config_default.refresh_token_secret);
  const userData = await pool.query(
    `
    
    SELECT * FROM users WHERE  email=$1
    
    `,
    [decoded.email]
  );
  if (userData.rowCount == 0) {
    throw new Error("User not found");
  }
  const user = userData.rows[0];
  const JwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email
  };
  const accessToken = jwt.sign(JwtPayload, config_default.access_token_secret, {
    expiresIn: "1d"
  });
  return { accessToken };
};
var authService = {
  registerUserIntoDB,
  loginUserFromDB,
  generateRefreshToken
};
var auth_service_default = authService;

// src/module/auth/auth.controller.ts
import { StatusCodes } from "http-status-codes";

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/module/auth/auth.controller.ts
var register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const payload = {
      name,
      email,
      password,
      role
    };
    const result = await auth_service_default.registerUserIntoDB(payload);
    const data = {
      success: true,
      message: "User registered successfully",
      statusCode: StatusCodes.CREATED,
      data: result.rows[0]
    };
    sendResponse_default(res, data);
  } catch (error) {
    const data = {
      success: false,
      message: error.message,
      statusCode: StatusCodes.BAD_REQUEST,
      error
    };
    sendResponse_default(res, data);
  }
};
var login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await auth_service_default.loginUserFromDB(password, email);
    const { refreshToken: refreshToken2, accessToken, user } = result;
    res.cookie("refreshToken", refreshToken2, {
      secure: false,
      // in production true
      httpOnly: true,
      sameSite: "lax"
    });
    const data = {
      success: true,
      message: "Login successful",
      statusCode: StatusCodes.OK,
      data: { token: accessToken, user }
    };
    sendResponse_default(res, data);
  } catch (error) {
    const data = {
      success: false,
      message: error.message,
      statusCode: StatusCodes.BAD_REQUEST,
      error
    };
    sendResponse_default(res, data);
  }
};
var refreshToken = async (req, res) => {
  try {
    const result = await auth_service_default.generateRefreshToken(
      req.cookies.refreshToken
    );
    const data = {
      success: true,
      message: "Access token generated",
      statusCode: StatusCodes.OK,
      data: result
    };
    sendResponse_default(res, data);
  } catch (error) {
    const data = {
      success: false,
      message: error.message,
      statusCode: StatusCodes.BAD_REQUEST,
      data: error
    };
    sendResponse_default(res, data);
  }
};
var authController = {
  register,
  login,
  refreshToken
};
var auth_controller_default = authController;

// src/module/auth/auth.route.ts
var router = Router();
router.post("/signup", auth_controller_default.register);
router.post("/login", auth_controller_default.login);
router.post("/refresh-token", auth_controller_default.refreshToken);
var authRoutes = router;

// src/module/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/module/issue/issue.service.ts
var createIssues = async (payload) => {
  const { title, description, type, email } = payload;
  const userData = await pool.query(
    `
    
    SELECT * FROM users WHERE email=$1
    
    `,
    [email]
  );
  const user = userData.rows[0];
  const result = await pool.query(
    `

        INSERT INTO issues(title,description,type,reported_id) VALUES($1,$2,$3,$4) RETURNING *

        `,
    [title, description, type, user.id]
  );
  return result.rows[0];
};
var getAllIssues = async (type, sort = "newest", status) => {
  const result = await pool.query(`
    SELECT * FROM issues 
  `);
  let issues = await Promise.all(
    result.rows.map(async (issue) => {
      const userData = await pool.query(
        `
        SELECT name, id, role
        FROM users
        WHERE id = $1
        `,
        [issue.reported_id]
        // or reported_id depending on your schema
      );
      const user = userData.rows[0];
      return {
        ...issue,
        reporter: user ? {
          id: user.id,
          name: user.name,
          role: user.role
        } : null
      };
    })
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
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else {
      issues.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
  }
  return issues;
};
var getIssueById = async (id) => {
  const result = await pool.query(
    `
    
    SELECT * FROM issues WHERE id=$1
    
    `,
    [id]
  );
  const issue = result.rows[0];
  const userData = await pool.query(
    `
      
      SELECT name,id,role FROM users WHERE id=$1
      
      `,
    [issue.reported_id]
  );
  const user = userData.rows[0];
  issue.reporter = user;
  return issue;
};
var updateIssue = async (issue_id, payload) => {
  const { title, description, type, id, role } = payload;
  const issue = await pool.query(
    `
      
      SELECT * FROM issues WHERE id=$1
      
      `,
    [issue_id]
  );
  if (issue.rowCount == 0) {
    throw new Error("issue is not found");
  }
  if (role === "contributor" && (issue.rows[0].reported_id !== id || issue.rows[0].status !== "open")) {
    throw new Error("UnAuthorized access");
  }
  const result = await pool.query(
    `
    UPDATE issues SET title=COALESCE($1,title),description=COALESCE($2,description),type=COALESCE($3,type)
    WHERE id=$4
    RETURNING *
    `,
    [title, description, type, id]
  );
  return result.rows[0];
};
var deleteIssue = async (id) => {
  const issue = await pool.query(
    `
    
    SELECT * FROM issues WHERE id=$1
    
    `,
    [id]
  );
  if (issue.rowCount == 0) {
    throw new Error("Issue is not found");
  }
  const result = await pool.query(
    `
    
    DELETE FROM issues WHERE id=$1 RETURNING *
    
    `,
    [id]
  );
  return result.rows[0];
};
var issueService = {
  createIssues,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue
};
var issue_service_default = issueService;

// src/module/issue/issue.controller.ts
import { StatusCodes as StatusCodes2 } from "http-status-codes";
var createIssues2 = async (req, res) => {
  const { title, description, type } = req.body;
  const payload = { title, description, type, email: "john.doe@devpulse.com" };
  const result = await issue_service_default.createIssues(payload);
  const data = {
    success: true,
    message: "Issue created successfully",
    statusCode: StatusCodes2.CREATED,
    data: result
  };
  sendResponse_default(res, data);
};
var getAllIssues2 = async (req, res) => {
  try {
    const type = req.query.type;
    const sort = req.query.sort;
    const status = req.query.status;
    const result = await issue_service_default.getAllIssues(type, sort, status);
    const data = {
      success: true,
      message: "Issues retrieved successfully",
      statusCode: StatusCodes2.OK,
      data: result
    };
    sendResponse_default(res, data);
  } catch (error) {
    const data = {
      success: false,
      message: error.message,
      statusCode: StatusCodes2.BAD_REQUEST,
      data: error
    };
    sendResponse_default(res, data);
  }
};
var getIssueById2 = async (req, res) => {
  try {
    const id = req.params.id;
    const issueId = Number(id);
    const result = await issue_service_default.getIssueById(issueId);
    const data = {
      success: true,
      message: "Issues retrieved successfully",
      statusCode: StatusCodes2.OK,
      data: result
    };
    sendResponse_default(res, data);
  } catch (error) {
    const data = {
      success: false,
      message: error.message,
      statusCode: StatusCodes2.BAD_REQUEST,
      data: error
    };
    sendResponse_default(res, data);
  }
};
var updateIssue2 = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    const {
      title,
      description,
      type
    } = req.body;
    const payload = {
      title,
      description,
      type,
      id: user?.id,
      role: user?.role
    };
    const result = await issue_service_default.updateIssue(id, payload);
    const data = {
      success: true,
      message: "Issue updated successfully",
      statusCode: StatusCodes2.OK,
      data: result
    };
    sendResponse_default(res, data);
  } catch (error) {
    const data = {
      success: false,
      message: error.message,
      statusCode: StatusCodes2.BAD_REQUEST,
      data: error
    };
    sendResponse_default(res, data);
  }
};
var deleteIssue2 = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await issue_service_default.deleteIssue(id);
    const data = {
      success: true,
      message: "Issue deleted successfully",
      statusCode: StatusCodes2.OK
    };
    sendResponse_default(res, data);
  } catch (error) {
    const data = {
      success: false,
      message: error.message,
      statusCode: StatusCodes2.BAD_REQUEST,
      data: error
    };
    sendResponse_default(res, data);
  }
};
var issueController = {
  createIssues: createIssues2,
  getAllIssues: getAllIssues2,
  getIssueById: getIssueById2,
  updateIssue: updateIssue2,
  deleteIssue: deleteIssue2
};
var issue_controller_default = issueController;

// src/middleware/auth.ts
import { StatusCodes as StatusCodes3 } from "http-status-codes";
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        const data = {
          success: false,
          message: "Unauthorized access!",
          statusCode: StatusCodes3.UNAUTHORIZED
        };
        return sendResponse_default(res, data);
      }
      const decoded = jwt2.verify(
        token,
        config_default.access_token_secret
      );
      const userData = await pool.query(
        `

        SELECT * FROM users WHERE email=$1

        `,
        [decoded.email]
      );
      if (userData.rowCount == 0) {
        const data = {
          success: false,
          message: "User not found",
          statusCode: StatusCodes3.NOT_FOUND
        };
        return sendResponse_default(res, data);
      }
      const user = userData.rows[0];
      if (roles.length && !roles.includes(user.role)) {
        const data = {
          success: false,
          message: "Forbidden!",
          statusCode: StatusCodes3.FORBIDDEN
        };
        return sendResponse_default(res, data);
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// src/type/index.ts
var USER_ROLE = {
  maintainer: "maintainer",
  contributor: "contributor"
};

// src/module/issue/issue.route.ts
var router2 = Router2();
router2.post(
  "/",
  auth(USER_ROLE.contributor, USER_ROLE.maintainer),
  issue_controller_default.createIssues
);
router2.get("/", issue_controller_default.getAllIssues);
router2.get("/:id", issue_controller_default.getIssueById);
router2.patch("/:id", auth(USER_ROLE.contributor, USER_ROLE.maintainer), issue_controller_default.updateIssue);
router2.delete("/:id", auth(USER_ROLE.maintainer), issue_controller_default.deleteIssue);
var issueRoutes = router2;
var issue_route_default = issueRoutes;

// src/app.ts
var app = express();
app.use(express.json());
app.use(cookieParser());
var corsOptions = {
  origin: "http://localhost:3000",
  optionalSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use("/api/auth", authRoutes);
app.use("/api/issues", issue_route_default);
app.get("/test", (req, res) => {
  res.status(StatusCodes4.OK).json({
    success: true,
    message: "Server is running successfully"
  });
});
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`server is running on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map