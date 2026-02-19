import { prisma } from "../core/db.js";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";
import axios from "axios";
import { PassThrough } from "stream";

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

function sanitizeYouTubeUrl(url) {
  try {
    if (url.includes("youtu.be/")) {
      const videoId = url.split("/").pop().split("?")[0];
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    if (url.includes("youtube.com/watch")) {
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get("v");
      if (!videoId) return url;
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return url;
  } catch {
    return url;
  }
}

export const createVideoLessons = async (req, res) => {
  const { title, videoUrl, courseIds, description } = req.body;

  if (!title || !videoUrl || !courseIds || !courseIds.length) {
    return res
      .status(400)
      .json({ message: "Title, video URL, and at least one course ID are required" });
  }

  let duration = 0;
  const sanitizedUrl = sanitizeYouTubeUrl(videoUrl);

  try {
    if (ytdl.validateURL(sanitizedUrl)) {
      try {
        const info = await ytdl.getInfo(sanitizedUrl);
        duration = parseInt(info.videoDetails.lengthSeconds, 10);
      } catch (ytErr) {
        console.warn(
          "Warning: Failed to fetch YouTube duration. Setting duration=0",
          ytErr.message
        );
        duration = 0; 
      }
    } else {
    
      const response = await axios.get(sanitizedUrl, { responseType: "stream" });
      const stream = new PassThrough();
      response.data.pipe(stream);

      duration = await new Promise((resolve, reject) => {
        ffmpeg(stream).ffprobe((err, metadata) => {
          if (err) return reject(err);
          resolve(Math.floor(metadata.format.duration));
        });
      });
    }

    const lessons = [];
    for (const courseId of courseIds) {
      const lesson = await prisma.lesson.create({
        data: {
          title,
          description: description || "",
          videoUrl,
          duration,
          courseId,
        },
      });
      lessons.push(lesson);
    }
    res.status(201).json({ message: "Lessons created", lessons });
  } catch (err) {
    res.status(500).json({
      message:
        "Failed to create lesson. Only direct video URLs (MP4/WebM/etc.) or YouTube links are supported.",
      error: err.message,
    });
  }
};

export const updateLesson = async (req, res) => {
  const { id } = req.params;
  const { title, description, videoUrl, courseIds } = req.body;

  if (!courseIds || courseIds.length === 0) {
    return res.status(400).json({ message: "At least one courseId is required" });
  }

  try {
    const results = [];

    for (const courseId of courseIds) {
      const existingLesson = await prisma.lesson.findFirst({
        where: { id, courseId },
      });
      let duration = existingLesson?.duration || 0;
      if (videoUrl) {
        const sanitizedUrl = sanitizeYouTubeUrl(videoUrl);
        if (ytdl.validateURL(sanitizedUrl)) {
          try {
            const info = await ytdl.getInfo(sanitizedUrl);
            duration = parseInt(info.videoDetails.lengthSeconds, 10);
          } catch (ytErr) {
            console.warn(
              "Warning: Failed to fetch YouTube duration. Keeping duration as 0",
              ytErr.message
            );
            duration = 0;
          }
        } else {
          try {
            const response = await axios.get(sanitizedUrl, { responseType: "stream" });
            const stream = new PassThrough();
            response.data.pipe(stream);
            duration = await new Promise((resolve, reject) => {
              ffmpeg(stream).ffprobe((err, metadata) => {
                if (err) return reject(err);
                resolve(Math.floor(metadata.format.duration));
              });
            });
          } catch (err) {
            duration = 0;
          }
        }
      }

      if (existingLesson) {
        const updated = await prisma.lesson.update({
          where: { id: existingLesson.id },
          data: {
            title: title || existingLesson.title,
            description: description || existingLesson.description,
            videoUrl: videoUrl || existingLesson.videoUrl,
            duration, 
          },
        });
        results.push(updated);
      } else {
        
        const created = await prisma.lesson.create({
          data: {
            title,
            description: description || "",
            videoUrl,
            duration,
            courseId,
          },
        });
        results.push(created);
      }
    }
    res.json({ message: "Lessons updated/created successfully", lessons: results });
  } catch (err) {
    res.status(500).json({ message: "Failed to update/create lessons", error: err.message });
  }
};

export const deleteLesson = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.lesson.delete({
      where: { id },
    });
    res.json({ message: "Lesson deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete lesson", error: err.message });
  }
};

export const getLesson = async (req, res) => {
  const { id } = req.params;
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: { course: true },
    });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch lesson", error: err.message });
  }
};  


export const getLessonById = async (req, res) => {
  const { lessonId } = req.params;
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        progress: { where: { userId: req.user.id } }
      }
    });
    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: "Error fetching lesson" });
  }
};


export const updateVideoProgress = async (req, res) => {
  const { id: lessonId } = req.params;
  const { timestamp, percentage } = req.body;
  const userId = req.user.id;

  try {
    const completed = percentage >= 90;
    const progress = await prisma.videoProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { timestamp, percentage, completed },
      create: { userId, lessonId, timestamp, percentage, completed }
    });

    res.json(progress);
  } catch (err) {
    res.status(500).json({ message: "Error updating progress" });
  }
};

export const getCourseProgress = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  try {
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      include: {
        progress: { where: { userId } }
      }
    });

    const total = lessons.length;
    const completed = lessons.filter(l => l.progress[0]?.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({ total, completed, percentage, lessons });
  } catch (err) {
    res.status(500).json({ message: "Error fetching course progress" });
  }
};
