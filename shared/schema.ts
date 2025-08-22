import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  avatarUrl: text("avatar_url"),
  role: text("role", { enum: ["USER", "ADMIN"] }).notNull().default("USER"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  sourceUrl: text("source_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: text("duration"),
  views: integer("views").default(0),
  canPlay: boolean("can_play").default(true),
  canShare: boolean("can_share").default(true),
  canDownload: boolean("can_download").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userVideosRelations = relations(users, ({ many }) => ({
  videos: many(videos),
}));

export const videoUsersRelations = relations(videos, ({ one }) => ({
  user: one(users),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
});

export const updateVideoSchema = insertVideoSchema.partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;
export type UpdateVideo = z.infer<typeof updateVideoSchema>;
