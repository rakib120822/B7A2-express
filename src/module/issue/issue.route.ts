import { Router } from "express";
import issueController from "./issue.controller";

const router: Router = Router();

router.post("/", issueController.createIssues);
router.get("/", issueController.getAllIssues);

const issueRoutes = router;
export default issueRoutes;
