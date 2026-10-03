import api from "../api/axios";

/**
 * ------------------------------------------------------------------
 * Course Registration Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

/**
 * Get all course registrations
 */
export const getCourseRegistrations = () => {
    return api.get("/course-registrations");
};

/**
 * Get a single course registration
 */
export const getCourseRegistration = (id) => {
    return api.get(`/course-registrations/${id}`);
};

/**
 * Get students registered for a specific course offering
 */
export const getRegistrationsByCourseOffering = (
    courseOfferingId
) => {
    return api.get(
        `/course-registrations/course-offering/${courseOfferingId}`
    );
};

/**
 * Create single course registration
 *
 * Faculty registers one student for one course offering.
 */
export const createCourseRegistration = (data) => {
    return api.post(
        "/course-registrations",
        data
    );
};

/**
 * Bulk register students
 *
 * Faculty can register multiple students
 * for the selected course offering.
 */
export const bulkRegisterStudents = ({
    courseOfferingId,
    studentIds,
}) => {
    return api.post(
        "/course-registrations/bulk",
        {
            courseOfferingId,
            studentIds,
        }
    );
};

/**
 * Update course registration
 */
export const updateCourseRegistration = (
    id,
    data
) => {
    return api.put(
        `/course-registrations/${id}`,
        data
    );
};

/**
 * Delete course registration
 */
export const deleteCourseRegistration = (id) => {
    return api.delete(
        `/course-registrations/${id}`
    );
};