import { prisma } from "../core/db.js";

export const getStudentProgress = async (req, res, next) => {
  try {
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 5;
    const skip = (page - 1) * limit;
    const courses = await prisma.course.findMany({
      include: {
        lessons: { include: { progress: true } },
        enrollments: { include: { user: true } }
      },
      skip,
      take: limit,
      orderBy: { name: "asc" }
    });

    const studentMap = new Map();

    courses.forEach(course => {
      const totalLessonsInCourse = course.lessons.length;

      course.enrollments.forEach(enrollment => {
        const completedLessons = course.lessons.filter(lesson =>
          lesson.progress.some(p => p.userId === enrollment.user.id && p.completed)
        ).length;

        const totalTimeSeconds = course.lessons.reduce((sum, lesson) => {
          const p = lesson.progress.find(p => p.userId === enrollment.user.id);
          return sum + (p?.timestamp || 0);
        }, 0);

        if (!studentMap.has(enrollment.user.id)) {
          studentMap.set(enrollment.user.id, {
            studentId: enrollment.user.id,
            studentName: enrollment.user.name,
            totalLessons: 0,
            completedLessons: 0,
            timeSpentSeconds: 0
          });
        }

        const student = studentMap.get(enrollment.user.id);
        student.totalLessons += totalLessonsInCourse;
        student.completedLessons += completedLessons;
        student.timeSpentSeconds += totalTimeSeconds;
      });
    });

    const data = Array.from(studentMap.values()).map(s => ({
      ...s,
      completion: s.totalLessons ? Math.floor((s.completedLessons / s.totalLessons) * 100) : 0,
      
      timeSpentFormatted: `${Math.floor(s.timeSpentSeconds / 3600)}h ${Math.floor((s.timeSpentSeconds % 3600) / 60)}m ${s.timeSpentSeconds % 60}s`
    }));

    const totalCount = data.length;

    res.json({ data, totalCount, page, limit });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate report", error: err.message });
  }
};

export const getCourseProgress = async (req, res, next) => {
  try {
    const page = parseInt(req.body.page) || 1;
    const limit = parseInt(req.body.limit) || 5;
    const skip = (page - 1) * limit;

    const courses = await prisma.course.findMany({
      include: {
        lessons: { include: { progress: true } },
        enrollments: { include: { user: true } }
      },
      skip,
      take: limit,
      orderBy: { name: "asc" }
    });

    const data = courses.map(course => {
      const totalLessons = course.lessons.length;

      const studentsProgress = course.enrollments.map(enrollment => {
        const completedLessons = course.lessons.filter(lesson =>
          lesson.progress.some(p => p.userId === enrollment.user.id && p.completed)
        ).length;

        const totalTimeSeconds = course.lessons.reduce((sum, lesson) => {
          const p = lesson.progress.find(p => p.userId === enrollment.user.id);
          return sum + (p?.timestamp || 0);
        }, 0);

        return {
          studentId: enrollment.user.id,
          studentName: enrollment.user.name,
          completedLessons,
          completion: totalLessons ? Math.floor((completedLessons / totalLessons) * 100) : 0,
          timeSpentSeconds: totalTimeSeconds,
          timeSpentFormatted: `${Math.floor(totalTimeSeconds / 3600)}h ${Math.floor((totalTimeSeconds % 3600) / 60)}m ${totalTimeSeconds % 60}s`
        };
      });

      return {
        courseId: course.id,
        courseName: course.name,
        totalLessons,
        studentsProgress
      };
    });

    const totalCount = await prisma.course.count();

    res.json({ data, totalCount, page, limit });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate report", error: err.message });
  }
};
