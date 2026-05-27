import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const config = {
  port: process.env.PORT as string,
  connecting_string: process.env.DB_CONNECTING_STRING as string,
};

export default config;
