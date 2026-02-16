import { NextRequest, NextResponse } from "next/server";

const HETZNER_API = "https://api.hetzner.cloud/v1";

const ALLOWED_PATHS = [
  /^\/servers$/,
  /^\/servers\/\d+$/,
  /^\/servers\/\d+\/actions$/,
  /^\/server_types$/,
  /^\/locations$/,
  /^\/images$/,
  /^\/firewalls$/,
  /^\/firewalls\/\d+\/actions\/set_rules$/,
];

const ALLOWED_METHODS = ["GET", "POST", "DELETE"];

export async function GET(req: NextRequest) {
  return proxyRequest(req, "GET");
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, "POST");
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req, "DELETE");
}

async function proxyRequest(req: NextRequest, method: string) {
  if (!ALLOWED_METHODS.includes(method)) {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing API key" },
      { status: 401 }
    );
  }

  // Extract the path from the URL after /api/vps/hetzner
  const url = new URL(req.url);
  const pathMatch = url.pathname.match(/\/api\/vps\/hetzner(\/.*)?/);
  const apiPath = pathMatch?.[1] || "";

  // Validate path against allowlist
  if (apiPath && !ALLOWED_PATHS.some((pattern) => pattern.test(apiPath))) {
    return NextResponse.json(
      { error: "Path not allowed" },
      { status: 403 }
    );
  }

  // Build target URL with query params
  const targetUrl = `${HETZNER_API}${apiPath}${url.search}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
  };

  let body: string | undefined;
  if (method === "POST") {
    headers["Content-Type"] = "application/json";
    body = await req.text();
  }

  try {
    const response = await fetch(targetUrl, {
      method,
      headers,
      body,
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reach Hetzner API" },
      { status: 502 }
    );
  }
}
