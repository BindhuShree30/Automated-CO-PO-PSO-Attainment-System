/**
 * ------------------------------------------------------------------
 * Faculty Assignment Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import {
    FacultyAssignment,
    Faculty,
    CourseOffering,
    Course,
    Batch,
    Semester,
  } from "../../database/index.js";
  
  /**
   * ------------------------------------------------------------------
   * Create Assignment
   * ------------------------------------------------------------------
   */
  
  const create = async (data) => {
    return await FacultyAssignment.create(data);
  };
  
  /**
   * ------------------------------------------------------------------
   * Find By ID
   * ------------------------------------------------------------------
   */
  
  const findById = async (id) => {
    return await FacultyAssignment.findByPk(id, {
      include: [
        {
          model: Faculty,
          as: "faculty",
        },
        {
          model: CourseOffering,
          as: "courseOffering",
          include: [
            {
              model: Course,
              as: "course",
            },
            {
              model: Batch,
              as: "batch",
            },
            {
              model: Semester,
              as: "semester",
            },
          ],
        },
      ],
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Find Existing Assignment
   * ------------------------------------------------------------------
   */
  
  const findExisting = async (
    facultyId,
    courseOfferingId
  ) => {
    return await FacultyAssignment.findOne({
      where: {
        facultyId,
        courseOfferingId,
      },
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Find Assignment For Course Offering
   * ------------------------------------------------------------------
   *
   * A course offering can have one active faculty assignment.
   * ------------------------------------------------------------------
   */
  
  const findByCourseOfferingId = async (
    courseOfferingId
  ) => {
    return await FacultyAssignment.findOne({
      where: {
        courseOfferingId,
        status: true,
      },
      include: [
        {
          model: Faculty,
          as: "faculty",
        },
      ],
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Find All
   * ------------------------------------------------------------------
   */
  
  const findAll = async () => {
    return await FacultyAssignment.findAll({
      where: {
        status: true,
      },
  
      include: [
        {
          model: Faculty,
          as: "faculty",
        },
        {
          model: CourseOffering,
          as: "courseOffering",
          include: [
            {
              model: Course,
              as: "course",
            },
            {
              model: Batch,
              as: "batch",
            },
            {
              model: Semester,
              as: "semester",
            },
          ],
        },
      ],
  
      order: [["createdAt", "DESC"]],
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Find Courses By Faculty
   * ------------------------------------------------------------------
   */
  
  const findByFacultyId = async (facultyId) => {
    return await FacultyAssignment.findAll({
      where: {
        facultyId,
        status: true,
      },
  
      include: [
        {
          model: Faculty,
          as: "faculty",
        },
        {
          model: CourseOffering,
          as: "courseOffering",
          include: [
            {
              model: Course,
              as: "course",
            },
            {
              model: Batch,
              as: "batch",
            },
            {
              model: Semester,
              as: "semester",
            },
          ],
        },
      ],
  
      order: [["createdAt", "DESC"]],
    });
  };
  
  /**
   * ------------------------------------------------------------------
   * Update
   * ------------------------------------------------------------------
   */
  
  const update = async (
    assignment,
    data
  ) => {
    return await assignment.update(data);
  };
  
  /**
   * ------------------------------------------------------------------
   * Delete
   * ------------------------------------------------------------------
   */
  
  const remove = async (assignment) => {
    return await assignment.destroy();
  };
  
  export default {
    create,
    findById,
    findExisting,
    findByCourseOfferingId,
    findAll,
    findByFacultyId,
    update,
    remove,
  };