import { Hono } from "hono";
import { db } from "./db";
import { usersTable } from "./db/schema";

const app = new Hono<{ Bindings: CloudflareBindings }>();

app.get("/", async (c) => {
  const res = await db
    .insert(usersTable)
    .values({ username: "test_user" })
    .returning();

  return c.json(res);
});

export default app;
