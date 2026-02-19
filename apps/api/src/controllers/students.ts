import { prisma } from "../core/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

export const createStudent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existingStudent = await prisma.user.findUnique({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hash = await bcrypt.hash(password, 10);
    const uniqueId = crypto.randomUUID();

    const student = await prisma.user.create({
      data: { name, email, password: hash, role: "STUDENT", uniqueId },
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: "Failed to create student", error: error.message });
  }
};

export const getStudents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const whereCondition = {
      role: "STUDENT",
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { uniqueId: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const students = await prisma.user.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        uniqueId: true,
        createdAt: true,
      },
    });

    const total = await prisma.user.count({ where: whereCondition });

    res.json({
      students,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students", error: error.message });
  }
};

export const getStudent = async (req, res) => {
  const { id } = req.params;
  const student = await prisma.user.findUnique({ where: { id, role: "STUDENT" } });
  if (!student) return res.status(404).json({ message: "Student not found" });
  res.json(student);
};

export const updateStudent = async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    const uniqueId = crypto.randomUUID();
    data.uniqueId = uniqueId;
    const existingStudent = await prisma.user.findUnique({ where: { id, role: "STUDENT" } });
    if (!existingStudent) return res.status(404).json({ message: "Student not found" });
    if (email && email !== existingStudent.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) return res.status(400).json({ message: "Email already in use" });
    }
    const updatedStudent = await prisma.user.update({
      where: { id, role: "STUDENT" },
      data,
    });
    res.json(updatedStudent);
};

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const studentCount = await prisma.user.count({ where: { role: "STUDENT" } });
    const courseCount = await prisma.course.count();
    const lessonCount = await prisma.lesson.count();
    const completedLessonsCount = await prisma.videoProgress.count({
      where: { completed: true },
    });

    const inProgressLessonsCount = await prisma.videoProgress.count({
      where: { percentage: { gt: 0, lt: 100 } },
    });

    const courses = await prisma.course.findMany({
      include: {
        lessons: {
          include: { progress: true },
        },
      },
    });

    const coursesData = courses.map((course) => {
      let completed = 0;
      let inProgress = 0;
      course.lessons.forEach((lesson) => {
        lesson.progress.forEach((p) => {
          if (p.completed) completed++;
          else if (p.percentage > 0 && p.percentage < 100) inProgress++;
        });
      });

      return {
        courseName: course.name,
        completed,
        inProgress,
      };
    });

    res.json({
      studentCount,
      courseCount,
      lessonCount,
      completedLessonsCount,
      inProgressLessonsCount,
      coursesData,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: { lessons: true },
      orderBy: { name: "asc" },
    });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch courses", error: err.message });
  }
};

export const assignCoursesToStudent = async (req, res) => {
  const { id: userId } = req.params;
  const { courseIds } = req.body;

  if (!userId || !courseIds?.length)
    return res.status(400).json({ message: "userId and at least one courseId are required" });

  try {
    await prisma.enrollment.deleteMany({
      where: { userId, courseId: { notIn: courseIds } },
    });

    for (const courseId of courseIds) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId, courseId } },
        update: {},
        create: { userId, courseId },
      });
    }

    res.json({ message: "Courses assigned successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to assign courses", error: err.message });
  }
};

export const getStudentCourses = async (req, res) => {
  const { id: userId } = req.params;
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: { course: { include: { lessons: true } } },
    });
    const courses = enrollments.map(e => e.course);
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch student courses", error: err.message });
  }
};

export const getLessonDetails = async (req, res) => {
  const { lessonId } = req.params;
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { course: true } });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json({ lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch lesson", error: err.message });
  }
};

export const getUserDashboardStats = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: studentId },
      include: {
        course: {
          include: {
            lessons: {
              include: {
                progress: { where: { userId: studentId } },
              },
            },
          },
        },
      },
    });

    let totalLessons = 0;
    let completedLessons = 0;
    let inProgressLessons = 0;

    enrollments.forEach((enrollment) => {
      enrollment.course.lessons.forEach((lesson) => {
        totalLessons++;
        const progress = lesson.progress[0];
        if (progress) {
          if (progress.completed) completedLessons++;
          else if (progress.percentage > 0) inProgressLessons++;
        }
      });
    });

    res.json({
      coursesEnrolled: enrollments.length,
      totalLessons,
      completedLessons,
      inProgressLessons,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user dashboard stats", error: err.message });
  }
};


