import type { NextFunction, Request, Response } from "express";
import sendResponse from "../utils/sendResponse";
import { StatusCodes } from "http-status-codes";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { ROLES } from "../type";

const auth = (...roles: ROLES[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        const data = {
          success: false,
          message: "Unauthorized access!",
          statusCode: StatusCodes.UNAUTHORIZED,
        };
        return sendResponse(res, data);
      }

      const decoded = jwt.verify(
        token,
        config.access_token_secret,
      ) as JwtPayload;

      const userData = await pool.query(
        `

        SELECT * FROM users WHERE email=$1

        `,
        [decoded.email],
      );

      if (userData.rowCount == 0) {
        const data = {
          success: false,
          message: "User not found",
          statusCode: StatusCodes.NOT_FOUND,
        };
        return sendResponse(res, data);
      }

      const user = userData.rows[0];

      if (roles.length && !roles.includes(user.role)) {
        const data = {
          success: false,
          message: "Forbidden!",
          statusCode: StatusCodes.FORBIDDEN,
        };
        return sendResponse(res, data);
      }

      req.user = decoded;
      next();
    } catch (error: any) {
      next(error);
    }
  };
};
