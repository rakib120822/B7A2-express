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
const issueController = {
  createIssues,
};

export default issueController;
