/**
 * ------------------------------------------------------------------
 * Enrollment Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Represents Student membership in an academic Batch.
 *
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const Enrollment = sequelize.define(
    "Enrollment",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        studentId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "student_id",
        },

        batchId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: "batch_id",
        },

        enrollmentDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            field: "enrollment_date",
        },

        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    },

    {
        tableName: "enrollments",
        timestamps: true,
        underscored: true,

        indexes: [
            {
                unique: true,
                fields: ["student_id", "batch_id"],
                name: "unique_student_batch_enrollment",
            },
            {
                fields: ["student_id"],
                name: "idx_enrollment_student",
            },
            {
                fields: ["batch_id"],
                name: "idx_enrollment_batch",
            },
            {
                fields: ["status"],
                name: "idx_enrollment_status",
            },
        ],
    }
);

/**
 * ------------------------------------------------------------------
 * Associations
 * ------------------------------------------------------------------
 */

Enrollment.associate = (models) => {
    Enrollment.belongsTo(models.Student, {
        foreignKey: "studentId",
        as: "student",
    });

    Enrollment.belongsTo(models.Batch, {
        foreignKey: "batchId",
        as: "batch",
    });
};

export default Enrollment;