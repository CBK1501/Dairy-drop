import mongoose from "mongoose";
import config from "../config/index.js";

export async function connectDB(): Promise<void> {
  await mongoose.connect(config.mongoUri);
  console.log("[db] MongoDB connected");
  await dropStaleIndexes();
}

async function dropStaleIndexes(): Promise<void> {
  try {
    const col = mongoose.connection.collection("deliveries");
    const indexes = await col.indexes();
    const stale = indexes.find((i) => i.name === "date_1");
    if (stale) {
      await col.dropIndex("date_1");
      console.log("[db] Dropped stale index: date_1");
    }
  } catch {
    // collection may not exist yet on first run
  }
}
