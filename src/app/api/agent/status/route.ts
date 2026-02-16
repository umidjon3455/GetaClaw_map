import { NextRequest, NextResponse } from "next/server";
import { fetchAgent } from "@/lib/agent/fetch";

export async function POST(req: NextRequest) {
  try {
    const { host, port } = await req.json();

    if (!host || !port) {
      return NextResponse.json(
        { error: "Missing host or port" },
        { status: 400 }
      );
    }

    const result = await fetchAgent(host, Number(port), "/setup-status");

    if (!result.ok) {
      return NextResponse.json(
        { error: "Agent returned non-200", status: result.status },
        { status: 502 }
      );
    }

    return NextResponse.json(result.data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to reach agent" },
      { status: 502 }
    );
  }
}
