/**
 * ------------------------------------------------------------------
 * Course Registration Controller
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import courseRegistrationService from "./courseRegistration.service.js";
import Faculty from "../../database/models/Faculty.js";

import asyncHandler from "../../shared/helpers/asyncHandler.js";
import { successResponse } from "../../shared/helpers/apiResponse.js";
import ApiError from "../../shared/errors/ApiError.js";

/**
 * ------------------------------------------------------------------
 * Helper: Resolve Faculty ID from Logged-in User
 * 
 * Maps users.id to faculties.id because course_offerings.faculty_id
 * references the faculties table.
 * ------------------------------------------------------------------
 */
const getEffectiveFacultyId = async (user) => {
    if (!user) return null;

    // 1. Direct property if populated by auth middleware
    if (user.facultyId) {
        return user.facultyId;
    }

    // 2. Query faculties table by email or user_id
    if (user.email) {
        const faculty = await Faculty.findOne({
            where: { email: user.email },
        });

        if (faculty) {
            return faculty.id;
        }
    }

    // 3. Fallback to user.id
    return user.id;
};

/**
 * ------------------------------------------------------------------
 * Create Single Course Registration
 * ------------------------------------------------------------------
 */
const createCourseRegistration = asyncHandler(async (req, res) => {
    const facultyId = await getEffectiveFacultyId(req.user);

    const registration = await courseRegistrationService.createCourseRegistration(
        req.validatedData?.body || req.body,
        facultyId
    );

    return successResponse(
        res,
        "Student enrolled in course successfully.",
        registration,
        201
    );
});

/**
 * ------------------------------------------------------------------
 * Get All Course Registrations
 * ------------------------------------------------------------------
 */
const getCourseRegistrations = asyncHandler(async (req, res) => {
    const registrations = await courseRegistrationService.getCourseRegistrations();

    return successResponse(
        res,
        "Course registrations fetched successfully.",
        registrations,
        200
    );
});

/**
 * ------------------------------------------------------------------
 * Get Course Registration By ID
 * ------------------------------------------------------------------
 */
const getCourseRegistrationById = asyncHandler(async (req, res) => {
    const id = req.validatedData?.params?.id || req.params.id;

    const registration = await courseRegistrationService.getCourseRegistrationById(id);

    return successResponse(
        res,
        "Course registration fetched successfully.",
        registration,
        200
    );
});

/**
 * ------------------------------------------------------------------
 * Get Students By Course Offering
 * ------------------------------------------------------------------
 */
const getRegistrationsByCourseOffering = asyncHandler(async (req, res) => {
    const courseOfferingId =
        req.validatedData?.params?.courseOfferingId ||
        req.params.courseOfferingId;

    const registrations =
        await courseRegistrationService.getRegistrationsByCourseOffering(
            courseOfferingId
        );

    return successResponse(
        res,
        "Course students fetched successfully.",
        registrations,
        200
    );
});

/**
 * ------------------------------------------------------------------
 * Update Course Registration
 * ------------------------------------------------------------------
 */
const updateCourseRegistration = asyncHandler(async (req, res) => {
    const facultyId = await getEffectiveFacultyId(req.user);
    const id = req.validatedData?.params?.id || req.params.id;
    const body = req.validatedData?.body || req.body;

    const registration = await courseRegistrationService.updateCourseRegistration(
        id,
        body,
        facultyId
    );

    return successResponse(
        res,
        "Course enrollment updated successfully.",
        registration,
        200
    );
});

/**
 * ------------------------------------------------------------------
 * Delete Course Registration
 * ------------------------------------------------------------------
 */
const deleteCourseRegistration = asyncHandler(async (req, res) => {
    const facultyId = await getEffectiveFacultyId(req.user);
    const id = req.validatedData?.params?.id || req.params.id;

    await courseRegistrationService.deleteCourseRegistration(id, facultyId);

    return successResponse(
        res,
        "Student removed from course successfully.",
        null,
        200
    );
});

/**
 * ------------------------------------------------------------------
 * Bulk Course Registration
 * ------------------------------------------------------------------
 */
const bulkRegisterStudents = asyncHandler(async (req, res) => {
    const facultyId = await getEffectiveFacultyId(req.user);

    const { courseOfferingId, studentIds } = req.body;

    if (!courseOfferingId) {
        throw new ApiError(400, "Course Offering ID is required.");
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
        throw new ApiError(400, "At least one student is required.");
    }

    const result = await courseRegistrationService.bulkRegisterStudents(
        courseOfferingId,
        studentIds,
        facultyId
    );

    return successResponse(
        res,
        `Course enrollment completed. ${result.enrolled} students enrolled.`,
        result,
        200
    );
});

export default {
    createCourseRegistration,
    getCourseRegistrations,
    getCourseRegistrationById,
    getRegistrationsByCourseOffering,
    updateCourseRegistration,
    deleteCourseRegistration,
    bulkRegisterStudents,
};