import { prisma } from "@/lib/db/client";

export async function GET() {
  const mem = process.memoryUsage();

  try {
    await prisma.$queryRaw`SELECT 1`;

    return Response.json({
      status: "ok",
      db: "connected",
      uptime: process.uptime(),
      memory: {
        rss: mem.rss,
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
      },
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  } catch {
    return Response.json(
      {
        status: "error",
        db: "disconnected",
        uptime: process.uptime(),
        memory: {
          rss: mem.rss,
          heapUsed: mem.heapUsed,
          heapTotal: mem.heapTotal,
        },
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      },
      { status: 503 }
    );
  }
}
