/**
 * ------------------------------------------------------------------
 * Course Registration Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Represents a student's enrollment in a specific Course Offering.
 *
 * Example:
 *
 * Student
 *    ↓
 * Course Registration
 *    ↓
 * Course Offering
 *    ↓
 * Course + Batch + Semester + Faculty + Section
 *
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const CourseRegistration = sequelize.define(
    "CourseRegistration",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        /**
         * ----------------------------------------------------------
         * Student
         * ----------------------------------------------------------
         */
        studentId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "student_id",
        },

        /**
         * ----------------------------------------------------------
         * Course Offering
         *
         * This identifies the exact course being taken by the
         * student under the assigned faculty.
         * ----------------------------------------------------------
         */
        courseOfferingId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "course_offering_id",
        },

        /**
         * ----------------------------------------------------------
         * Registration Date
         * ----------------------------------------------------------
         *
         * Kept for database compatibility and audit purposes.
         * Faculty does not need to enter this manually.
         */
        registrationDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: "registration_date",
        },

        /**
         * ----------------------------------------------------------
         * Status
         * ----------------------------------------------------------
         */
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },
    {
        tableName: "course_registrations",

        timestamps: true,

        underscored: true,

        indexes: [
            /**
             * A student cannot be registered twice for the
             * same course offering.
             */
            {
                unique: true,
                fields: [
                    "student_id",
                    "course_offering_id",
                ],
                name:
                    "unique_student_course_offering_registration",
            },

            {
                fields: ["student_id"],
                name:
                    "idx_course_registration_student",
            },

            {
                fields: ["course_offering_id"],
                name:
                    "idx_course_registration_offering",
            },

            {
                fields: ["status"],
                name:
                    "idx_course_registration_status",
            },
        ],
    }
);

/**
 * ------------------------------------------------------------------
 * Associations
 * ------------------------------------------------------------------
 */

CourseRegistration.associate = (models) => {
    CourseRegistration.belongsTo(models.Student, {
        foreignKey: "studentId",
        as: "student",
    });

    CourseRegistration.belongsTo(models.CourseOffering, {
        foreignKey: "courseOfferingId",
        as: "courseOffering",
    });
};

export default CourseRegistration;