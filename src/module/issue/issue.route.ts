import { Router } from "express";
import issueController from "./issue.controller";
import { auth } from "../../middleware/auth";
import { USER_ROLE } from "../../type";

const router: Router = Router();

router.post(
  "/",
  auth(USER_ROLE.contributor, USER_ROLE.maintainer),
  issueController.createIssues,
);
router.get("/", issueController.getAllIssues);
router.get("/:id", issueController.getIssueById);
router.patch("/:id", auth(USER_ROLE.contributor,USER_ROLE.maintainer), issueController.updateIssue);
router.delete("/:id", auth(USER_ROLE.maintainer), issueController.deleteIssue);

const issueRoutes = router;
export default issueRoutes;
