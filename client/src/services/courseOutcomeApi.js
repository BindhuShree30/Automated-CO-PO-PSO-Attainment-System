import api from "../api/axios";

const BASE_URL = "/co";

export const getCourseOutcomes = async () => {
  const response = await api.get(BASE_URL);
  return response.data.data;
};

export const getCourseOutcomesByCourse = async (courseId) => {
  const response = await api.get(
    `${BASE_URL}/course/${courseId}`
  );

  return response.data.data;
};

export const getCourseOutcomeById = async (id) => {
  const response = await api.get(
    `${BASE_URL}/${id}`
  );

  return response.data.data;
};

export const createCourseOutcome = async (data) => {
  const response = await api.post(
    BASE_URL,
    data
  );

  return response.data.data;
};

export const updateCourseOutcome = async (
  id,
  data
) => {
  const response = await api.put(
    `${BASE_URL}/${id}`,
    data
  );

  return response.data.data;
};

export const deleteCourseOutcome = async (id) => {
  const response = await api.delete(
    `${BASE_URL}/${id}`
  );

  return response.data.data;
};