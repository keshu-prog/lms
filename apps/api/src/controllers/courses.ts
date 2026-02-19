import { prisma } from "../core/db.js";
import jwt from "jsonwebtoken";

export const getCourses = async (req, res) => {
  const { page = 1, limit = 10 } = req.body; 
  const skip = (page - 1) * limit;

  const courses = await prisma.course.findMany({
    skip: skip,
    take: limit,
    include: {
      lessons: true,
    },
  });

  const totalCourses = await prisma.course.count();

  res.json({
    data: courses,
    total: totalCourses,
    page,
    totalPages: Math.ceil(totalCourses / limit),
  });
};

export const createCourse = async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Course name is required" });
  }
  if(!description){
    return res.status(400).json({ message: "Course description is required" });
  }
  if (description && description.length > 500) {
    return res.status(400).json({ message: "Description cannot exceed 500 characters" });
  }

  const course = await prisma.course.create({
    data: { name, description },
  });
  res.status(201).json(course);
};

export const updateCourse = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Course name is required" });
  }
  if (!description) {
    return res.status(400).json({ message: "Course description is required" });
  }
  if (description.length > 500) {
    return res.status(400).json({ message: "Description cannot exceed 500 characters" });
  }

  try {
    const course = await prisma.course.update({
      where: { id: id },
      data: { name, description },
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: "Failed to update course" });
  }
};
export const deleteCourse = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.lesson.deleteMany({
      where: { courseId: id },
    });

    await prisma.course.delete({ where: { id } });

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete course", error: error.message });
  }
};

export const removeAssignment = async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    await prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    res.json({ message: "Course removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove assignment" });
  }
};

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const getCoursesByStudent = async (req, res) => {
  try {
    const userId = req.user.id;
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            lessons: {
              include: {
                progress: {
                  where: { userId },
                },
              },
            },
          },
        },
      },
    });

    const courses = enrollments.map((e) => {
      const course = e.course;
      const lessonsWithProgress = course.lessons.map((lesson) => {
        const lessonProgress = lesson.progress[0];
        const percentage = lessonProgress ? lessonProgress.percentage : 0;
        const completed = lessonProgress ? lessonProgress.completed : false;

        return {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          videoUrl: lesson.videoUrl,
          duration: lesson.duration,
          courseId: lesson.courseId,
          percentage,
          completed,
        };
      });
      const totalProgress =
        lessonsWithProgress.reduce((sum, l) => sum + l.percentage, 0) /
        (lessonsWithProgress.length || 1);

      return {
        id: course.id,
        name: course.name,
        description: course.description,
        createdAt: course.createdAt,
        lessons: lessonsWithProgress,
        overallProgress: totalProgress,
      };
    });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: "Error fetching courses" });
  }
};




