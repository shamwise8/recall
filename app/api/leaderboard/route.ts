import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const KV_KEY = "leaderboard-scores";

function getRedis() {
  return new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
}

export async function GET() {
  try {
    const redis = getRedis();
    const data = await redis.get<string>(KV_KEY);
    const entries = data ? (typeof data === "string" ? JSON.parse(data) : data) : [];
    return NextResponse.json(entries);
  } catch (err) {
    console.error("Leaderboard GET error:", err);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const redis = getRedis();
    const entry = await req.json();
    const data = await redis.get<string>(KV_KEY);
    const entries = data ? (typeof data === "string" ? JSON.parse(data) : data) : [];
    entries.push(entry);
    const trimmed = entries.slice(-500);
    await redis.set(KV_KEY, JSON.stringify(trimmed));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Leaderboard POST error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
