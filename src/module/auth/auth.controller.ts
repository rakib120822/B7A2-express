import type { Request, Response } from "express";
import authService from "./auth.service";
import type { IUser } from "./auth.interface";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../utils/sendResponse";

// user register
const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const payload: IUser = {
      name,
      email,
      password,
      role,
    };
    const result = await authService.registerUserIntoDB(payload);

    const data = {
      success: true,
      message: "User register successfully",
      statusCode: StatusCodes.CREATED,
      data: result.rows[0],
    };
    sendResponse(res, data);
  } catch (error: any) {
    const data = {
      success: false,
      message: error.message,
      statusCode: StatusCodes.BAD_REQUEST,
      error: error,
    };
    sendResponse(res, data);
  }
};

//user login
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // console.log({ email, password });
    const result = await authService.loginUserFromDB(password, email);
    const { refreshToken } = result;
    res.cookie("refreshToken", refreshToken, {
      secure: false, // in production true
      httpOnly: true,
      sameSite: "lax",
    });
    const data = {
      success: true,
      message: "Login successful",
      statusCode: StatusCodes.OK,
      data: result,
    };
    sendResponse(res, data);
  } catch (error: any) {
    const data = {
      success: false,
      message: error.message,
      statusCode: StatusCodes.BAD_REQUEST,
      error: error,
    };
    sendResponse(res, data);
  }
};

// generate access token
const refreshToken = async (req: Request, res: Response) => {
  try {
    // console.log("from controller");
    const result = await authService.generateRefreshToken(
      req.cookies.refreshToken,
    );
    const data = {
      success: true,
      message: "Access token generated",
      statusCode: StatusCodes.OK,
      data: result,
    };
    sendResponse(res, data);
  } catch (error: any) {
    const data = {
      success: false,
      message: error.message,
      statusCode: StatusCodes.BAD_REQUEST,
      data: error,
    };
    sendResponse(res, data);
  }
};

const authController = {
  register,
  login,
  refreshToken,
};

export default authController;
