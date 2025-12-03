import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users_table", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const leaderboardsTable = pgTable("leaderboards_table", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  apiKey: text("api_key").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserSelect = typeof usersTable.$inferSelect;
export type LeaderboardSelect = typeof leaderboardsTable.$inferSelect;
export type UserInsert = typeof usersTable.$inferInsert;
export type LeaderboardInsert = typeof leaderboardsTable.$inferInsert;
