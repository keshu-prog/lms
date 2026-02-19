export const updateProgress = async (req, res) => {
  const { lessonId, percentage, timestamp } = req.body;

  await prisma.videoProgress.upsert({
    where: { id: lessonId },
    update: { percentage, timestamp, completed: percentage >= 90 },
    create: { lessonId, userId: req.user.id, percentage, timestamp, completed: percentage >= 90 }
  });

  res.send("saved");
};
