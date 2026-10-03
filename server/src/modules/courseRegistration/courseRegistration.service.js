/**
 * ------------------------------------------------------------------
 * Course Registration Service
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Business logic for Course Registration.
 *
 * IMPORTANT:
 * - Course Offering belongs to a Faculty.
 * - Faculty ID stored in course_offerings.faculty_id
 *   is faculties.id, NOT users.id.
 * - Faculty can manage registrations only for their own
 *   Course Offerings.
 * ------------------------------------------------------------------
 */

import crypto from "crypto";

import courseRegistrationRepository from "./courseRegistration.repository.js";
import courseOfferingRepository from "../courseOffering/courseOffering.repository.js";
import studentRepository from "../student/student.repository.js";
import ApiError from "../../shared/errors/ApiError.js";

/**
 * ------------------------------------------------------------------
 * Helper: Verify Faculty Owns Course Offering
 * ------------------------------------------------------------------
 */
const verifyFacultyCourseOffering = async (
    courseOfferingId,
    facultyId
) => {
    const courseOffering =
        await courseOfferingRepository.findCourseOfferingById(
            courseOfferingId
        );

    if (!courseOffering) {
        throw new ApiError(
            404,
            "Course offering not found."
        );
    }

    // Only enforce if offering has an assigned faculty and facultyId is provided
    if (
        courseOffering.facultyId &&
        facultyId &&
        String(courseOffering.facultyId).toLowerCase() !==
            String(facultyId).toLowerCase()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to manage registrations for this course offering."
        );
    }

    return courseOffering;
};

/**
 * ------------------------------------------------------------------
 * Helper: Verify Student Exists
 * ------------------------------------------------------------------
 */
const verifyStudent = async (studentId) => {
    // Supports both repository method naming conventions
    const student =
        typeof studentRepository.findById === "function"
            ? await studentRepository.findById(studentId)
            : await studentRepository.findStudentById(studentId);

    if (!student) {
        throw new ApiError(
            404,
            "Student not found."
        );
    }

    return student;
};

/**
 * ------------------------------------------------------------------
 * Create Single Course Registration
 * ------------------------------------------------------------------
 */
const createCourseRegistration = async (
    data,
    facultyId
) => {
    const {
        studentId,
        courseOfferingId,
        registrationDate = new Date().toISOString().split("T")[0],
        status = true,
    } = data;

    /**
     * Verify Course Offering belongs to Faculty
     */
    await verifyFacultyCourseOffering(
        courseOfferingId,
        facultyId
    );

    /**
     * Verify Student exists
     */
    await verifyStudent(studentId);

    /**
     * Prevent duplicate registration
     */
    const existing =
        await courseRegistrationRepository
            .findByStudentAndCourseOffering(
                studentId,
                courseOfferingId
            );

    if (existing) {
        throw new ApiError(
            409,
            "Student is already registered for this course."
        );
    }

    /**
     * Create registration with explicit UUID
     */
    const registration =
        await courseRegistrationRepository.create({
            id: crypto.randomUUID(),
            studentId,
            courseOfferingId,
            registrationDate,
            status,
        });

    /**
     * Return complete registration
     */
    return courseRegistrationRepository.findById(
        registration.id
    );
};

/**
 * ------------------------------------------------------------------
 * Get All Course Registrations
 * ------------------------------------------------------------------
 */
const getCourseRegistrations = async () => {
    return courseRegistrationRepository.findAll();
};

/**
 * ------------------------------------------------------------------
 * Get Course Registration By ID
 * ------------------------------------------------------------------
 */
const getCourseRegistrationById = async (id) => {
    const registration =
        await courseRegistrationRepository.findById(id);

    if (!registration) {
        throw new ApiError(
            404,
            "Course registration not found."
        );
    }

    return registration;
};

/**
 * ------------------------------------------------------------------
 * Get Registrations By Course Offering
 * ------------------------------------------------------------------
 */
const getRegistrationsByCourseOffering = async (
    courseOfferingId
) => {
    const courseOffering =
        await courseOfferingRepository.findCourseOfferingById(
            courseOfferingId
        );

    if (!courseOffering) {
        throw new ApiError(
            404,
            "Course offering not found."
        );
    }

    return courseRegistrationRepository
        .findByCourseOfferingId(courseOfferingId);
};

/**
 * ------------------------------------------------------------------
 * Get Registrations By Student
 * ------------------------------------------------------------------
 */
const getRegistrationsByStudent = async (studentId) => {
    await verifyStudent(studentId);

    return courseRegistrationRepository
        .findByStudentId(studentId);
};

/**
 * ------------------------------------------------------------------
 * Update Course Registration
 * ------------------------------------------------------------------
 */
const updateCourseRegistration = async (
    id,
    data,
    facultyId
) => {
    const registration =
        await courseRegistrationRepository.findById(id);

    if (!registration) {
        throw new ApiError(
            404,
            "Course registration not found."
        );
    }

    const courseOfferingId =
        data.courseOfferingId ||
        registration.courseOfferingId;

    await verifyFacultyCourseOffering(
        courseOfferingId,
        facultyId
    );

    if (data.studentId) {
        await verifyStudent(data.studentId);
    }

    if (
        data.studentId ||
        data.courseOfferingId
    ) {
        const studentId =
            data.studentId ||
            registration.studentId;

        const existing =
            await courseRegistrationRepository
                .findByStudentAndCourseOffering(
                    studentId,
                    courseOfferingId
                );

        if (
            existing &&
            String(existing.id) !== String(id)
        ) {
            throw new ApiError(
                409,
                "Student is already registered for this course."
            );
        }
    }

    const updated =
        await courseRegistrationRepository.update(
            id,
            data
        );

    if (!updated) {
        throw new ApiError(
            404,
            "Course registration not found."
        );
    }

    return updated;
};

/**
 * ------------------------------------------------------------------
 * Delete Course Registration
 * ------------------------------------------------------------------
 */
const deleteCourseRegistration = async (
    id,
    facultyId
) => {
    const registration =
        await courseRegistrationRepository.findById(id);

    if (!registration) {
        throw new ApiError(
            404,
            "Course registration not found."
        );
    }

    await verifyFacultyCourseOffering(
        registration.courseOfferingId,
        facultyId
    );

    const deleted =
        await courseRegistrationRepository.delete(id);

    if (!deleted) {
        throw new ApiError(
            404,
            "Course registration not found."
        );
    }

    return true;
};

/**
 * ------------------------------------------------------------------
 * Bulk Register Students
 * ------------------------------------------------------------------
 */
const bulkRegisterStudents = async (
    courseOfferingId,
    studentIds,
    facultyId
) => {
    /**
     * Verify Faculty owns Course Offering
     */
    await verifyFacultyCourseOffering(
        courseOfferingId,
        facultyId
    );

    /**
     * Remove duplicate student IDs
     */
    const uniqueStudentIds = [
        ...new Set(studentIds),
    ];

    let enrolled = 0;
    let alreadyEnrolled = 0;
    let invalidStudents = [];

    const todayDate = new Date()
        .toISOString()
        .split("T")[0];

    for (const studentId of uniqueStudentIds) {
        /**
         * Verify student exists
         */
        let student = null;
        try {
            student =
                typeof studentRepository.findById === "function"
                    ? await studentRepository.findById(studentId)
                    : await studentRepository.findStudentById(studentId);
        } catch {
            student = null;
        }

        if (!student) {
            invalidStudents.push(studentId);
            continue;
        }

        /**
         * Check existing registration
         */
        const existing =
            await courseRegistrationRepository
                .findByStudentAndCourseOffering(
                    studentId,
                    courseOfferingId
                );

        if (existing) {
            alreadyEnrolled++;
            continue;
        }

        /**
         * Create registration with explicit UUID
         */
        await courseRegistrationRepository.create({
            id: crypto.randomUUID(),
            studentId,
            courseOfferingId,
            registrationDate: todayDate,
            status: true,
        });

        enrolled++;
    }

    return {
        enrolled,
        alreadyEnrolled,
        invalidStudents,
        totalRequested: uniqueStudentIds.length,
    };
};

export default {
    createCourseRegistration,
    getCourseRegistrations,
    getCourseRegistrationById,
    getRegistrationsByCourseOffering,
    getRegistrationsByStudent,
    updateCourseRegistration,
    deleteCourseRegistration,
    bulkRegisterStudents,
};