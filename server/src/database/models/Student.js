/**
 * ------------------------------------------------------------------
 * Student Model
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Represents the permanent academic identity of a Student.
 *
 * ------------------------------------------------------------------
 */

import { DataTypes } from "sequelize";
import sequelize from "../connection.js";

const Student = sequelize.define(
    "Student",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },

        usn: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },

        firstName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "first_name",
        },

        lastName: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: "last_name",
        },

        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
        },

        phone: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },

        departmentId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: "department_id",
        },

        semesterId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: "semester_id",
        },
    },
    {
        tableName: "students",
        timestamps: true,
        underscored: true,

        indexes: [
            {
                fields: ["department_id"],
                name: "idx_student_department",
            },
            {
                fields: ["semester_id"],
                name: "idx_student_semester",
            },
        ],
    }
);

export default Student;