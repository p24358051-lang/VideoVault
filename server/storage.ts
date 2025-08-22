import { users, videos, type User, type InsertUser, type Video, type InsertVideo, type UpdateVideo } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import session, { SessionStore } from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserAvatar(userId: string, avatarUrl: string): Promise<void>;
  
  getVideos(): Promise<Video[]>;
  getVideo(id: string): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: string, video: UpdateVideo): Promise<Video | undefined>;
  deleteVideo(id: string): Promise<boolean>;
  incrementVideoViews(id: string): Promise<void>;
  
  sessionStore: SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserAvatar(userId: string, avatarUrl: string): Promise<void> {
    await db
      .update(users)
      .set({ avatarUrl })
      .where(eq(users.id, userId));
  }

  async getVideos(): Promise<Video[]> {
    return await db.select().from(videos).orderBy(desc(videos.createdAt));
  }

  async getVideo(id: string): Promise<Video | undefined> {
    const [video] = await db.select().from(videos).where(eq(videos.id, id));
    return video || undefined;
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db
      .insert(videos)
      .values(video)
      .returning();
    return newVideo;
  }

  async updateVideo(id: string, video: UpdateVideo): Promise<Video | undefined> {
    const [updatedVideo] = await db
      .update(videos)
      .set({ ...video, updatedAt: new Date() })
      .where(eq(videos.id, id))
      .returning();
    return updatedVideo || undefined;
  }

  async deleteVideo(id: string): Promise<boolean> {
    const result = await db.delete(videos).where(eq(videos.id, id));
    return (result.rowCount || 0) > 0;
  }

  async incrementVideoViews(id: string): Promise<void> {
    await db
      .update(videos)
      .set({ views: sql`${videos.views} + 1` })
      .where(eq(videos.id, id));
  }
}

export const storage = new DatabaseStorage();
