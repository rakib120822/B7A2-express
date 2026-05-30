import type { Request, Response } from "express";
import issueService from "./issue.service";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../utils/sendResponse";

// create issues
const createIssues = async (req: Request, res: Response) => {
  const { title, description, type } = req.body;
  const payload = { title, description, type, email: "john.doe@devpulse.com" };
  const result = await issueService.createIssues(payload);
  const data = {
    success: true,
    message: "Issue created successfully",
    statusCode: StatusCodes.CREATED,
    data: result,
  };

  sendResponse(res, data);
};

// get all issues
const getAllIssues = async (req: Request, res: Response) => {
  try {
    const type = req.query.type as string;
    const sort = req.query.sort as string;
    const status = req.query.status as string;

    const result = await issueService.getAllIssues(type, sort, status);
    const data = {
      success: true,
      message: "Issues retrieved successfully",
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

// get issue by id
const getIssueById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const issueId: number = Number(id);
    const result = await issueService.getIssueById(issueId);
    // console.log(result);
    const data = {
      success: true,
      message: "Issues retrieved successfully",
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

// update issue
const updateIssue = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const {
      title,
      description,
      type,
    }: {
      title: string;
      description: string;
      type: string;
    } = req.body;
    const payload = {
      title,
      description,
      type,
      id: 1,
      role: "maintainer",
    };
    const result = await issueService.updateIssue(id, payload);
    const data = {
      success: true,
      message: "Issue updated successfully",
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

const deleteIssue = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const result = await issueService.deleteIssue(id);
    const data = {
      success: true,
      message: "Issue deleted successfully",
      statusCode: StatusCodes.OK,
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
const issueController = {
  createIssues,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue
};

export default issueController;
