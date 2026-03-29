import { NextRequest, NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics/tracker";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.eventType) {
      return NextResponse.json({ error: "eventType required" }, { status: 400 });
    }

    // Fire-and-forget: track event without blocking response
    trackEvent({
      eventType: body.eventType,
      targetType: body.targetType,
      targetId: body.targetId ? parseInt(body.targetId, 10) : undefined,
      targetName: body.targetName,
      searchQuery: body.searchQuery,
      sessionId: body.sessionId,
      clientId: body.clientId ? parseInt(body.clientId, 10) : undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
      referrer: request.headers.get("referer") ?? undefined,
      extra: body.extra,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
