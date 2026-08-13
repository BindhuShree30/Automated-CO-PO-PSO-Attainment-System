import api from "../api/axios";

/**
 * Get All Courses
 */
export const getCourses = async () => {
  const response = await api.get("/courses");

  return response.data?.data ?? [];
};


/**
 * Get Course By ID
 */
export const getCourse = async (id) => {
  const response = await api.get(
    `/courses/${id}`
  );

  return response.data?.data ?? null;
};


/**
 * Create Course
 */
export const createCourse = async (data) => {
  const response = await api.post(
    "/courses",
    data
  );

  return response.data?.data ?? null;
};


/**
 * Update Course
 */
export const updateCourse = async (
  id,
  data
) => {
  const response = await api.put(
    `/courses/${id}`,
    data
  );

  return response.data?.data ?? null;
};


/**
 * Delete Course
 */
export const deleteCourse = async (id) => {
  const response = await api.delete(
    `/courses/${id}`
  );

  return response.data;
};