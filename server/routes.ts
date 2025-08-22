import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import path from "path";
import { setupAuth, requireAuth, requireAdmin } from "./auth";
import { storage } from "./storage";
import { insertVideoSchema, updateVideoSchema } from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", express.static(uploadDir));

  // Profile picture upload
  app.post("/api/me/avatar", requireAuth, upload.single("avatar"), async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const avatarUrl = `/uploads/${req.file.filename}`;
      await storage.updateUserAvatar(req.user!.id, avatarUrl);

      res.json({ avatarUrl });
    } catch (error) {
      next(error);
    }
  });

  // Video routes for users
  app.get("/api/videos", requireAuth, async (req, res, next) => {
    try {
      const videos = await storage.getVideos();
      // Filter out sensitive admin-only fields for regular users
      const publicVideos = videos.map(video => ({
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: video.views,
        canPlay: video.canPlay,
        canShare: video.canShare,
        canDownload: video.canDownload,
        createdAt: video.createdAt,
      }));
      res.json(publicVideos);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/videos/:id", requireAuth, async (req, res, next) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      // Increment view count
      await storage.incrementVideoViews(video.id);

      res.json({
        id: video.id,
        title: video.title,
        description: video.description,
        sourceUrl: video.sourceUrl,
        thumbnailUrl: video.thumbnailUrl,
        duration: video.duration,
        views: (video.views || 0) + 1,
        canPlay: video.canPlay,
        canShare: video.canShare,
        canDownload: video.canDownload,
        createdAt: video.createdAt,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/videos/:id/download", requireAuth, async (req, res, next) => {
    try {
      const video = await storage.getVideo(req.params.id);
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      if (!video.canDownload) {
        return res.status(403).json({ message: "Download not allowed for this video" });
      }

      // Redirect to the actual video URL for download
      res.redirect(video.sourceUrl);
    } catch (error) {
      next(error);
    }
  });

  // Admin routes
  app.get("/api/admin/videos", requireAdmin, async (req, res, next) => {
    try {
      const videos = await storage.getVideos();
      res.json(videos);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/videos", requireAdmin, async (req, res, next) => {
    try {
      const videoData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(videoData);
      res.status(201).json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid video data", errors: error.errors });
      }
      next(error);
    }
  });

  app.put("/api/admin/videos/:id", requireAdmin, async (req, res, next) => {
    try {
      const videoData = updateVideoSchema.parse(req.body);
      const video = await storage.updateVideo(req.params.id, videoData);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }

      res.json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid video data", errors: error.errors });
      }
      next(error);
    }
  });

  app.delete("/api/admin/videos/:id", requireAdmin, async (req, res, next) => {
    try {
      const deleted = await storage.deleteVideo(req.params.id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Video not found" });
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // Admin stats
  app.get("/api/admin/stats", requireAdmin, async (req, res, next) => {
    try {
      const videos = await storage.getVideos();
      const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0);
      
      res.json({
        totalVideos: videos.length,
        totalUsers: 1249, // Placeholder - would need user count query
        totalViews,
      });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
