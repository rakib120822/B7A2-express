import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { StatusCodes } from "http-status-codes";
import { authRoutes } from "./module/auth/auth.route";
import issueRoutes from "./module/issue/issue.route";

const app: Application = express();

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:3000",
  optionalSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);

app.get("/test", (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: "Server is running successfully",
  });
});

export default app;
