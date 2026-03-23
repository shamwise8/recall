import Redis from "ioredis";
import { NextResponse } from "next/server";

const KV_KEY = "leaderboard-scores";

let redis: Redis | null = null;

function getRedis() {
  if (!redis) {
    redis = new Redis(process.env.KV_REST_API_REDIS_URL!, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
  }
  return redis;
}

export async function GET() {
  try {
    const client = getRedis();
    const data = await client.get(KV_KEY);
    const entries = data ? JSON.parse(data) : [];
    return NextResponse.json(entries);
  } catch (err) {
    console.error("Leaderboard GET error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const client = getRedis();
    const entry = await req.json();
    const data = await client.get(KV_KEY);
    const entries = data ? JSON.parse(data) : [];
    entries.push(entry);
    const trimmed = entries.slice(-500);
    await client.set(KV_KEY, JSON.stringify(trimmed));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Leaderboard POST error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
