import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { get } from "@vercel/blob";
import { NextRequest } from "next/server";
import { getInnerUser } from "../../../lib/auth";
import { getAccessStatusForUser } from "../../../lib/subscription-status";

export const runtime = "nodejs";

const TRACKS = {
  female: {
    blobPath: "audio/nl/standard/female.m4a",
    localPath: "public/audio/standard/female.m4a",
  },
  male: {
    blobPath: "audio/nl/standard/male.m4a",
    localPath: "public/audio/standard/male.m4a",
  },
  ambience: {
    blobPath: "audio/nl/layers/ambience.m4a",
    localPath: "public/audio/ambience.m4a",
  },
  breathing: {
    blobPath: "audio/nl/layers/breathing.m4a",
    localPath: "public/audio/breathing/breathing-08-loud.m4a",
  },
} as const;

type TrackName = keyof typeof TRACKS;

function isTrackName(value: string): value is TrackName {
  return value in TRACKS;
}

function parseRange(range: string | null, size: number) {
  const match = range?.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return null;

  const start = match[1] ? Number(match[1]) : 0;
  const end = match[2] ? Number(match[2]) : size - 1;
  if (!Number.isInteger(start) || !Number.isInteger(end) || start > end || end >= size) {
    return null;
  }
  return { start, end };
}

async function serveLocalFile(request: NextRequest, relativePath: string) {
  // Local-only fallback. Production always reads from private Vercel Blob.
  const filePath = path.join(/* turbopackIgnore: true */ process.cwd(), relativePath);
  const fileStats = await stat(filePath);
  const range = parseRange(request.headers.get("range"), fileStats.size);
  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store",
    "Content-Type": "audio/mp4",
  });

  if (range) {
    headers.set("Content-Length", String(range.end - range.start + 1));
    headers.set("Content-Range", `bytes ${range.start}-${range.end}/${fileStats.size}`);
  } else {
    headers.set("Content-Length", String(fileStats.size));
  }

  const stream = createReadStream(filePath, range ?? undefined);
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    status: range ? 206 : 200,
    headers,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ track: string }> }
) {
  const user = await getInnerUser();
  if (!user) return Response.json({ error: "Niet ingelogd." }, { status: 401 });

  const access = await getAccessStatusForUser(user);
  if (!access.hasActiveAccess) {
    return Response.json({ error: "Actief abonnement vereist." }, { status: 403 });
  }

  const { track } = await params;
  if (!isTrackName(track)) {
    return Response.json({ error: "Audiotrack niet gevonden." }, { status: 404 });
  }

  const config = TRACKS[track];
  if (process.env.NODE_ENV !== "production" && !process.env.BLOB_READ_WRITE_TOKEN) {
    return serveLocalFile(request, config.localPath);
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Audio-opslag is nog niet geconfigureerd." },
      { status: 503 }
    );
  }

  const result = await get(config.blobPath, {
    access: "private",
    headers: request.headers.get("range")
      ? { Range: request.headers.get("range") as string }
      : undefined,
  });

  if (!result) {
    return Response.json({ error: "Audiotrack niet gevonden." }, { status: 404 });
  }

  const headers = new Headers();
  result.headers.forEach((value, key) => headers.set(key, value));
  headers.set("Cache-Control", "private, no-store");
  headers.set("Content-Disposition", "inline");
  const status = headers.has("content-range") ? 206 : result.statusCode;

  return new Response(result.stream, { status, headers });
}
