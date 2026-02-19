import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import {getAllcoursesWithlessons,createCourses,updateCourse,deleteCourse,createVideoLessons,updateLesson,deleteLesson} from "../../api";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [videoPreview, setVideoPreview] = useState(null);

  const [editingCourse, setEditingCourse] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  const [courseForm, setCourseForm] = useState({ name: "", description: "" });
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    duration: "",
    courseIds: [],
  });


  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5);

  useEffect(() => {
    fetchCourses();
  }, [page]);

  const fetchCourses = async () => {
    const res = await getAllcoursesWithlessons(page, limit);
    setCourses(res.data.data);
    setTotalPages(res.data.totalPages);
  };

  // ===== Convert YouTube URL to EMBED =====
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  const handleCourseSubmit = async () => {
    if (!courseForm.name) return alert("Name required");
    if (!courseForm.description) return alert("Description required");

    if (editingCourse) {
      await updateCourse(editingCourse.id, courseForm);
    } else {
      await createCourses(courseForm);
    }

    closeCourseModal();
    fetchCourses();
  };

  const handleLessonSubmit = async () => {
    if (!lessonForm.title || !lessonForm.videoUrl || !lessonForm.courseIds.length)
      return alert("All fields required");

    if (editingLesson) {
      await updateLesson(editingLesson.id, lessonForm);
    } else {
      await createVideoLessons(lessonForm);
    }

    closeLessonModal();
    fetchCourses();
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Delete course?")) return;
    await deleteCourse(id);
    fetchCourses();
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm("Delete lesson?")) return;
    await deleteLesson(id);
    fetchCourses();
  };

  const closeCourseModal = () => {
    setShowCourseModal(false);
    setEditingCourse(null);
    setCourseForm({ name: "", description: "" });
  };

  const closeLessonModal = () => {
    setShowLessonModal(false);
    setEditingLesson(null);
    setLessonForm({
      title: "",
      description: "",
      videoUrl: "",
      duration: "",
      courseIds: [],
    });
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Course Management</h2>
        <span className="text-gray-600 mb-4 block">
          Sample video URLs:
          <ul className="list-disc ml-5">
            <li className="flex items-center gap-2">
              <span>
                https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_30MB.mp4
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_30MB.mp4"
                  );
                  alert("Copied to clipboard!");
                }}
                className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
              >
                Copy
              </button>
            </li>
            <li className="flex items-center gap-2">
              <span>
                  https://docs.evostream.com/sample_content/assets/bunny.mp4
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    "https://docs.evostream.com/sample_content/assets/bunny.mp4"
                  );
                  alert("Copied to clipboard!");
                }}
                className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
              >
                Copy
              </button>
            </li>
          </ul>
        </span>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowCourseModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Create Course
          </button>

          <button
            onClick={() => setShowLessonModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            + Add Lesson
          </button>
        </div>

        {/* COURSES TABLE */}
        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Course</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Lessons</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td className="border p-2">{course.name}</td>
                <td className="border p-2">{course.description}</td>

                {/* LESSON TABLE */}
                <td className="border p-2">
                  <table className="w-full border">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border p-1">Lesson</th>
                        <th className="border p-1">Description</th>
                        <th className="border p-1">Video</th>
                        <th className="border p-1">Duration</th>
                        <th className="border p-1">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {course.lessons?.length ? (
                        course.lessons.map((lesson) => (
                          <tr key={lesson.id}>
                            <td className="border p-1">{lesson.title}</td>
                            <td className="border p-1">{lesson.description}</td>

                            <td className="border p-1">
                              <button
                                onClick={() => setVideoPreview(lesson.videoUrl)}
                                className="text-blue-600 underline"
                              >
                                Preview
                              </button>
                            </td>

                            <td className="border p-1">{lesson.duration}</td>

                            <td className="border p-1 space-x-1">
                              <button
                                onClick={() => {
                                  setEditingLesson(lesson);
                                  setLessonForm({
                                    ...lesson,
                                    courseIds: [course.id],
                                  });
                                  setShowLessonModal(true);
                                }}
                                className="bg-yellow-500 text-white px-2 py-1 rounded"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="bg-red-500 text-white px-2 py-1 rounded"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center p-2">
                            No lessons
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </td>

                <td className="border p-2 space-x-1">
                  <button
                    onClick={() => {
                      setEditingCourse(course);
                      setCourseForm(course);
                      setShowCourseModal(true);
                    }}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>

                  <button
                    onClick={() => {
                      setLessonForm({ ...lessonForm, courseIds: [course.id] });
                      setShowLessonModal(true);
                    }}
                    className="bg-green-600 text-white px-2 py-1 rounded"
                  >
                    + Lesson
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded"
          >
            Previous
          </button>

          <span className="px-3 py-1">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded"
          >
            Next
          </button>
        </div>

        {/* COURSE MODAL */}
        {showCourseModal && (
          <Modal title="Course" onClose={closeCourseModal}>
            <input
              className="border w-full p-2 mb-2"
              placeholder="Name"
              value={courseForm.name}
              onChange={(e) =>
                setCourseForm({ ...courseForm, name: e.target.value })
              }
            />

            <textarea
              className="border w-full p-2 mb-2"
              placeholder="Description"
              value={courseForm.description}
              onChange={(e) =>
                setCourseForm({ ...courseForm, description: e.target.value })
              }
            />

            <button
              onClick={handleCourseSubmit}
              className="bg-blue-600 text-white px-4 py-2 w-full"
            >
              Save
            </button>
          </Modal>
        )}

        {/* LESSON MODAL */}
        {showLessonModal && (
          <Modal title="Lesson" onClose={closeLessonModal}>
            <select
              multiple
              className="border w-full p-2 mb-2"
              value={lessonForm.courseIds}
              onChange={(e) =>
                setLessonForm({
                  ...lessonForm,
                  courseIds: Array.from(e.target.selectedOptions, (o) => o.value),
                })
              }
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              className="border w-full p-2 mb-2"
              placeholder="Title"
              value={lessonForm.title}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, title: e.target.value })
              }
            />

            <textarea
              className="border w-full p-2 mb-2"
              placeholder="Description"
              value={lessonForm.description}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, description: e.target.value })
              }
            />

            <input
              className="border w-full p-2 mb-2"
              placeholder="Video URL"
              value={lessonForm.videoUrl}
              onChange={(e) =>
                setLessonForm({ ...lessonForm, videoUrl: e.target.value })
              }
            />

            <button
              onClick={handleLessonSubmit}
              className="bg-green-600 text-white px-4 py-2 w-full"
            >
              Save
            </button>
          </Modal>
        )}

        {/* VIDEO PREVIEW MODAL */}
        {videoPreview && (
          <Modal title="Video Preview" onClose={() => setVideoPreview(null)}>
            {videoPreview.includes(".mp4") ? (
              <video controls width="100%">
                <source src={videoPreview} type="video/mp4" />
              </video>
            ) : (
              <iframe
                width="100%"
                height="300"
                src={getEmbedUrl(videoPreview)}
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video"
              />
            )}
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}

function Modal({ title, children, onClose }) {
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          padding: 20,
          width: 520,
          borderRadius: 8,
        }}
      >
        <h3 className="mb-3 font-bold">{title}</h3>
        {children}
      </div>
    </div>,
    document.body
  );
}
