import bcrypt from "bcryptjs";
import { pool } from "../../db";
import type { IUser } from "./auth.interface";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";

// register
const registerUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;
  const hashPassword = await bcrypt.hash(password, 10);
  console.log(hashPassword);

  const result = await pool.query(
    `
    
    INSERT INTO users(name,email,password,role) VALUES($1, $2, $3, COALESCE($4,'contributor')) RETURNING *
    
    `,
    [name, email, hashPassword, role],
  );

  delete result.rows[0].password;

  return result;
};

// login

const loginUserFromDB = async (password: string, email: string) => {
  if (!password || !email) {
    throw new Error("Credentials are required");
  }

  const userData = await pool.query(
    `
    
    SELECT * FROM users WHERE email=$1

    `,
    [email],
  );
  //   console.log(userData);
  if (userData.rowCount == 0) {
    throw new Error("User Is not found");
  }

  const user = userData.rows[0];

  const isMatched = await bcrypt.compare(password, user.password);
  //   console.log(isMatched);
  if (!isMatched) {
    throw new Error("Invalid Credential");
  }

  const JwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  const accessToken = jwt.sign(JwtPayload, config.access_token_secret, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign(JwtPayload, config.refresh_token_secret, {
    expiresIn: "10d",
  });

  delete user.password;
  return { accessToken, user, refreshToken };
};

const generateRefreshToken = async (token: string) => {
  //   console.log("from service");
  if (!token) {
    throw new Error("Unauthorized access");
  }
  const decoded = jwt.verify(token, config.refresh_token_secret) as JwtPayload;
  //   console.log(decoded);
  const userData = await pool.query(
    `
    
    SELECT * FROM users WHERE  email=$1
    
    `,
    [decoded.email],
  );

  if (userData.rowCount == 0) {
    throw new Error("User not found");
  }
  const user = userData.rows[0];
  const JwtPayload = {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
  };

  const accessToken = jwt.sign(JwtPayload, config.access_token_secret, {
    expiresIn: "1d",
  });

  return { accessToken };
};
const authService = {
  registerUserIntoDB,
  loginUserFromDB,
  generateRefreshToken,
};

export default authService;
