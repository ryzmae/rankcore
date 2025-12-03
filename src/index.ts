import { Hono } from "hono";
import { createDb } from "./db";
import { usersTable } from "./db/schema";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/", async (c) => {
  const db = createDb(c.env.DATABSE_URL);
  const res = await db
    .insert(usersTable)
    .values({ username: "test_user" })
    .returning();

  return c.json(res);
});

export default app;
