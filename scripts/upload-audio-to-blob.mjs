import { readFile, rm, stat } from "node:fs/promises";

const files = [
  ["audio/nl/standard/female.m4a", "public/audio/standard/female.m4a"],
  ["audio/nl/standard/male.m4a", "public/audio/standard/male.m4a"],
  ["audio/nl/layers/ambience.m4a", "public/audio/ambience.m4a"],
  ["audio/nl/layers/breathing.m4a", "public/audio/breathing/breathing-08-loud.m4a"],
];

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.log("Audio-upload overgeslagen: BLOB_READ_WRITE_TOKEN ontbreekt.");
  process.exit(0);
}

const { BlobNotFoundError, head, put } = await import("@vercel/blob");

for (const [pathname, localPath] of files) {
  const fileStats = await stat(localPath);
  let remoteSize = null;

  try {
    remoteSize = (await head(pathname)).size;
  } catch (error) {
    if (!(error instanceof BlobNotFoundError)) throw error;
  }

  if (remoteSize !== fileStats.size) {
    const body = await readFile(localPath);
    const result = await put(pathname, body, {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "audio/mp4",
      multipart: fileStats.size > 5 * 1024 * 1024,
    });
    console.log(`Uploaded ${localPath} -> ${result.pathname}`);
  } else {
    console.log(`Audio staat al in Blob: ${pathname}`);
  }

  // Vercel builds should never publish the source recordings as static files.
  if (process.env.VERCEL) {
    await rm(localPath);
  }
}
