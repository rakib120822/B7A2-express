import { Router } from "express";
import issueController from "./issue.controller";

const router: Router = Router();

router.post("/", issueController.createIssues);
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getIssueById);
router.patch("/:id", issueController.updateIssue);
router.delete("/:id", issueController.deleteIssue);

const issueRoutes = router;
export default issueRoutes;
