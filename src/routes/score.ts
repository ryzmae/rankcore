import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  ScoreSubmissionSchema,
  ScoreSubmissionPayload,
} from "../schemas/score";
import { createRedis } from "../lib/Redis";
import { authenticateApiKey } from "../middleware/api-auth";

const scores = new Hono();

scores.post(
  "/v1/scores/:leaderboardId",
  authenticateApiKey,
  zValidator("json", ScoreSubmissionSchema),
  async (c) => {
    const data: ScoreSubmissionPayload = c.req.valid("json");
    const leaderboardId = c.req.param("leaderboardId");
    const { userId, score } = data;

    try {
      const redis = createRedis(
        c.env.UPSTASH_REDIS_URL,
        c.env.UPSTASH_REDIS_TOKEN
      );
      const result = await redis.zadd(leaderboardId, { score, member: userId });

      return c.json(
        {
          success: true,
          message: "Score submitted successfully.",
          status: result === 1 ? "CREATED" : "UPDATED",
          score: score,
        },
        201
      );
    } catch (error) {
      console.error("Dragonfly ZADD error:", error);
      return c.json(
        { success: false, message: "Database operation failed." },
        500
      );
    }
  }
);

export default scores;
