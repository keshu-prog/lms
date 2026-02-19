import { prisma } from "../core/db.js";
export const getStudentAssignments = async (req, res) => {
  const { id } = req.params;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: id },
    include: {
      course: {
        include: {
          lessons: true
        }
      }
    }
  });

  const courses = enrollments.map(e => e.course);

  res.json({ courses });
};


