import { createMiddleware } from "hono/factory";
import { createRedis } from "../lib/Redis";
import { createDb } from "../db";
import { leaderboardsTable } from "../db/schema";
import { eq } from "drizzle-orm";

type ApiKeyMetadata = {
  appId: string;
  rateLimit: number;
};

export const authenticateApiKey = createMiddleware<{
  Bindings: CloudflareBindings;
  Variables: {
    apiKeyMetadata: ApiKeyMetadata;
  };
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { success: false, message: "Authorization header missing or malformed." },
      401
    );
  }

  const apiKey = authHeader.substring(7);
  const redisKey = `auth:apikey:${apiKey}`;
  let metadata: ApiKeyMetadata | null = null;

  const redis = createRedis(c.env.UPSTASH_REDIS_URL, c.env.UPSTASH_REDIS_TOKEN);
  const cachedData = await redis.get<ApiKeyMetadata>(redisKey);

  if (cachedData) {
    metadata = cachedData;
  } else {
    const db = createDb(c.env.DATABASE_URL);
    const result = await db
      .select()
      .from(leaderboardsTable)
      .where(eq(leaderboardsTable.apiKey, apiKey))
      .limit(1);

    if (result.length > 0) {
      metadata = {
        appId: result[0].id.toString(),
        rateLimit: 60,
      };
      await redis.set(redisKey, metadata, { ex: 3600 });
    }
  }

  if (!metadata) {
    return c.json({ success: false, message: "Invalid API key." }, 403);
  }

  c.set("apiKeyMetadata", metadata);
  await next();
});
