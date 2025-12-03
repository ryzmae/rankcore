import { Hono } from "hono";
import ScoreRouter from "./routes/score";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/", async (c) => {
  return c.json({ message: "Welcome to RankCore API!" });
});

app.route("/scores", ScoreRouter);

export default app;
