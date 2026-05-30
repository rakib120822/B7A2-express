import { Router } from "express";
import issueController from "./issue.controller";

const router:Router = Router();

router.post("/",issueController.createIssues)

const issueRoutes = router;
export default issueRoutes