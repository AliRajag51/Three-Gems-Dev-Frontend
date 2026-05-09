import { copyFile, stat } from "node:fs/promises";
import { join } from "node:path";

const serverDir = join(process.cwd(), "dist", "server");
const workerEntry = join(serverDir, "index.js");
const previewEntry = join(serverDir, "server.js");

try {
  await stat(workerEntry);
  await copyFile(workerEntry, previewEntry);
} catch (error) {
  throw new Error(`Unable to prepare Vite preview server entry: ${error.message}`);
}
