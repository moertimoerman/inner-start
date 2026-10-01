import { readFile } from "node:fs/promises";
import { put } from "@vercel/blob";

const files = [
  ["audio/nl/standard/female.m4a", "public/audio/standard/female.m4a"],
  ["audio/nl/standard/male.m4a", "public/audio/standard/male.m4a"],
  ["audio/nl/layers/ambience.m4a", "public/audio/ambience.m4a"],
  ["audio/nl/layers/breathing.m4a", "public/audio/breathing/breathing-08-loud.m4a"],
];

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error("BLOB_READ_WRITE_TOKEN ontbreekt.");
}

for (const [pathname, localPath] of files) {
  const body = await readFile(localPath);
  const result = await put(pathname, body, {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "audio/mp4",
  });
  console.log(`Uploaded ${localPath} -> ${result.pathname}`);
}
