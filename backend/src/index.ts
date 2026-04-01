import "dotenv/config";
import app from "./app.js";
import config from "./config/index.js";
import { connectDB } from "./lib/db.js";
import { seedAdminUser } from "./lib/seed.js";

async function bootstrap() {
  await connectDB();
  await seedAdminUser();

  app.listen(config.port, () => {
    console.log(`[server] Running → http://localhost:${config.port}`);
    console.log(`[server] Environment: ${config.nodeEnv}`);
  });
}

bootstrap().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
