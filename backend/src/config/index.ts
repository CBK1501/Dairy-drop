import dotenv from "dotenv";
dotenv.config();

const config = {
  port: Number(process.env.PORT) || 5000 || "https://dairy-drop-be.onrender.com",
  mongoUri: process.env.MONGODB_URI || "",
  nodeEnv: process.env.NODE_ENV || "development",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
};

if (!config.mongoUri) {
  throw new Error("MONGODB_URI is required in .env");
}

export default config;
