import { useEffect, useState, useRef } from "react";
import { getCoursesByStudent, updateVideoProgress } from "../../api";
import DashboardLayout from "../../layouts/DashboardLayout";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(null);
  const progressBuffer = useRef({});
  const progressTimer = useRef(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getCoursesByStudent();
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleWatchLesson = (lesson) => {
    setCurrentLesson(lesson);
  };

  const scheduleProgressUpdate = () => {
    if (progressTimer.current) return; 

    progressTimer.current = setTimeout(async () => {
      const updates = { ...progressBuffer.current };
      progressBuffer.current = {};
      progressTimer.current = null;

      for (const lessonId in updates) {
        const { timestamp, percentage } = updates[lessonId];
        try {
          await updateVideoProgress(lessonId, { timestamp, percentage });
        } catch (err) {
          console.error("Failed to update progress for lesson", lessonId, err);
        }
      }
      await refreshCourses();
    }, 5000);
  };

  const handleProgressChange = (lessonId, currentTime, videoDuration) => {
    const percentage = (currentTime / videoDuration) * 100;
    progressBuffer.current[lessonId] = { timestamp: Math.floor(currentTime), percentage };
    scheduleProgressUpdate();
  };

  const flushProgress = async () => {
    if (progressTimer.current) clearTimeout(progressTimer.current);

    const updates = { ...progressBuffer.current };
    progressBuffer.current = {};

    for (const lessonId in updates) {
      const { timestamp, percentage } = updates[lessonId];
      try {
        await updateVideoProgress(lessonId, { timestamp, percentage });
      } catch (err) {
        console.error("Failed to update progress for lesson", lessonId, err);
      }
    }

    await refreshCourses();
  };

  const refreshCourses = async () => {
    try {
      const res = await getCoursesByStudent();
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to refresh courses", err);
    }
  };

  const calculateTotalDuration = (lessons) =>
    lessons.reduce((total, lesson) => total + lesson.duration, 0);

  return (
    <DashboardLayout role="student">
      <div style={{ padding: "30px", background: "#f5f7fa", minHeight: "100vh" }}>
        <h2 style={{ marginBottom: "30px", fontWeight: "600" }}>My Courses</h2>

        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p>No courses assigned yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
              gap: "25px",
            }}
          >
            {courses.map((course) => {
              const totalDuration = calculateTotalDuration(course.lessons);
              const overallProgress =
                course.lessons.reduce((sum, l) => sum + l.percentage, 0) /
                (course.lessons.length || 1);

              return (
                <div
                  key={course.id}
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    transition: "0.3s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-6px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      height: "160px",
                      background: "linear-gradient(135deg, #0056d2, #003087)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "22px",
                      fontWeight: "600",
                    }}
                  >
                    {course.name.charAt(0)}
                  </div>

                  {/* Course Content */}
                  <div style={{ padding: "20px" }}>
                    <h3 style={{ marginBottom: "8px", fontSize: "18px", fontWeight: "600" }}>
                      {course.name}
                    </h3>
                    <p style={{ fontSize: "14px", color: "#5f6368", marginBottom: "12px" }}>
                      {course.description}
                    </p>

                    <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "12px" }}>
                      {course.lessons.length} lessons • {totalDuration / 60} mins
                    </div>

                    {/* Overall Progress Bar */}
                    <div
                      style={{
                        height: "8px",
                        width: "100%",
                        background: "#e2e8f0",
                        borderRadius: "4px",
                        marginBottom: "12px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${overallProgress}%`,
                          background: "#0056d2",
                          transition: "0.3s",
                        }}
                      ></div>
                    </div>
                    <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "10px" }}>
                      Overall Progress: {overallProgress.toFixed(1)}%
                    </p>

                    {/* Lessons */}
                    {course.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        style={{
                          fontSize: "14px",
                          marginBottom: "6px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <span>• {lesson.title}</span>
                          {/* Individual Lesson Progress */}
                          <div
                            style={{
                              height: "6px",
                              width: "100%",
                              background: "#e2e8f0",
                              borderRadius: "3px",
                              marginTop: "4px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${lesson.percentage}%`,
                                background: "#10b981",
                                transition: "0.3s",
                              }}
                            ></div>
                          </div>
                        </div>
                        <button
                          style={{
                            background: "#0056d2",
                            color: "white",
                            border: "none",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "12px",
                            marginLeft: "10px",
                          }}
                          onClick={() => handleWatchLesson(lesson)}
                        >
                          Watch
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Video Modal */}
        {currentLesson && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={async () => {
              await flushProgress();
              setCurrentLesson(null);
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                width: "80%",
                maxWidth: "800px",
                padding: "20px",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: "12px" }}>{currentLesson.title}</h3>
              <video
                width="100%"
                controls
                onTimeUpdate={(e) => {
                  const video = e.target;
                  const percentage = (video.currentTime / video.duration) * 100;
                  handleProgressChange(currentLesson.id,video.currentTime, percentage);
                }}
              >
                <source src={currentLesson.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <button
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "red",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
                onClick={async () => {
                  await flushProgress();
                  setCurrentLesson(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
