/**
 * ------------------------------------------------------------------
 * Course Registration Routes
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { Router } from "express";

import courseRegistrationController
    from "./courseRegistration.controller.js";

import authMiddleware
    from "../../middleware/auth.middleware.js";

import roleMiddleware
    from "../../middleware/role.middleware.js";

import validate
    from "../../middleware/validate.middleware.js";

import ROLES
    from "../../shared/constants/roles.js";

import {
    createCourseRegistrationSchema,
    updateCourseRegistrationSchema,
    courseRegistrationIdSchema,
    courseOfferingIdParamSchema,
} from "./courseRegistration.schema.js";

const router = Router();

/**
 * ------------------------------------------------------------------
 * Create Single Course Enrollment
 * ------------------------------------------------------------------
 *
 * Faculty only.
 *
 * Faculty can only enroll students into
 * their assigned Course Offering.
 *
 * ------------------------------------------------------------------
 */

router.post(
    "/",
    authMiddleware,
    roleMiddleware(
        ROLES.FACULTY
    ),
    validate(
        createCourseRegistrationSchema
    ),
    courseRegistrationController
        .createCourseRegistration
);

/**
 * ------------------------------------------------------------------
 * Bulk Course Enrollment
 * ------------------------------------------------------------------
 *
 * Faculty can enroll multiple students
 * into their assigned Course Offering.
 *
 * ------------------------------------------------------------------
 */

router.post(
    "/bulk",
    authMiddleware,
    roleMiddleware(
        ROLES.FACULTY
    ),
    courseRegistrationController
        .bulkRegisterStudents
);

/**
 * ------------------------------------------------------------------
 * Get All Course Registrations
 * ------------------------------------------------------------------
 */

router.get(
    "/",
    authMiddleware,
    courseRegistrationController
        .getCourseRegistrations
);

/**
 * ------------------------------------------------------------------
 * Get Students Registered For Course Offering
 * ------------------------------------------------------------------
 *
 * IMPORTANT:
 * This route must come before "/:id".
 *
 * ------------------------------------------------------------------
 */

router.get(
    "/course-offering/:courseOfferingId",
    authMiddleware,
    validate(
        courseOfferingIdParamSchema
    ),
    courseRegistrationController
        .getRegistrationsByCourseOffering
);

/**
 * ------------------------------------------------------------------
 * Get Course Registration By ID
 * ------------------------------------------------------------------
 */

router.get(
    "/:id",
    authMiddleware,
    validate(
        courseRegistrationIdSchema
    ),
    courseRegistrationController
        .getCourseRegistrationById
);

/**
 * ------------------------------------------------------------------
 * Update Course Registration
 * ------------------------------------------------------------------
 */

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware(
        ROLES.FACULTY
    ),
    validate(
        updateCourseRegistrationSchema
    ),
    courseRegistrationController
        .updateCourseRegistration
);

/**
 * ------------------------------------------------------------------
 * Delete Course Registration
 * ------------------------------------------------------------------
 */

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware(
        ROLES.FACULTY
    ),
    validate(
        courseRegistrationIdSchema
    ),
    courseRegistrationController
        .deleteCourseRegistration
);

export default router;