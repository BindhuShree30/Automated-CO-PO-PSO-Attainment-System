import {
  COPOMapping,
  Course,
  CourseOutcome,
  Program,
  ProgramOutcome,
} from "../../database/index.js";

/**
 * ------------------------------------------------------------------
 * Create CO-PO Mapping
 * ------------------------------------------------------------------
 */
const create = async (data) => {
  return await COPOMapping.create(data);
};

/**
 * ------------------------------------------------------------------
 * Get All CO-PO Mappings
 * ------------------------------------------------------------------
 */
const findAll = async () => {
  return await COPOMapping.findAll({
    include: [
      {
        model: CourseOutcome,
        as: "courseOutcome",
      },
      {
        model: ProgramOutcome,
        as: "programOutcome",
      },
    ],
  });
};

/**
 * ------------------------------------------------------------------
 * Get Mapping By ID
 * ------------------------------------------------------------------
 */
const findById = async (id) => {
  return await COPOMapping.findByPk(id, {
    include: [
      {
        model: CourseOutcome,
        as: "courseOutcome",
      },
      {
        model: ProgramOutcome,
        as: "programOutcome",
      },
    ],
  });
};

/**
 * ------------------------------------------------------------------
 * Get Mappings By Course Outcome
 * ------------------------------------------------------------------
 */
const findByCourseOutcomeId = async (courseOutcomeId) => {
  return await COPOMapping.findAll({
    where: {
      courseOutcomeId,
    },
    include: [
      {
        model: ProgramOutcome,
        as: "programOutcome",
      },
    ],
  });
};

/**
 * ------------------------------------------------------------------
 * Get Mappings By Program Outcome
 * ------------------------------------------------------------------
 */
const findByProgramOutcomeId = async (programOutcomeId) => {
  return await COPOMapping.findAll({
    where: {
      programOutcomeId,
    },
    include: [
      {
        model: CourseOutcome,
        as: "courseOutcome",
      },
    ],
  });
};

/**
 * ------------------------------------------------------------------
 * Find Existing Mapping
 * ------------------------------------------------------------------
 */
const findExistingMapping = async (
  courseOutcomeId,
  programOutcomeId
) => {
  return await COPOMapping.findOne({
    where: {
      courseOutcomeId,
      programOutcomeId,
    },
  });
};

/**
 * ------------------------------------------------------------------
 * Get NBA Matrix Data
 * ------------------------------------------------------------------
 */
const getMatrixData = async (courseId) => {
  const course = await Course.findByPk(courseId, {
    include: [
      {
        model: Program,
        as: "program",
      },
      {
        model: CourseOutcome,
        as: "courseOutcomes",
      },
    ],
  });

  if (!course) {
    return null;
  }

  const programOutcomes = await ProgramOutcome.findAll({
    where: {
      programId: course.programId,
      status: true,
    },
    order: [["code", "ASC"]],
  });

  const mappings = await COPOMapping.findAll({
    include: [
      {
        model: CourseOutcome,
        as: "courseOutcome",
        where: {
          courseId,
        },
      },
      {
        model: ProgramOutcome,
        as: "programOutcome",
      },
    ],
  });

  return {
    course,
    courseOutcomes: course.courseOutcomes,
    programOutcomes,
    mappings,
  };
};

/**
 * ------------------------------------------------------------------
 * Save NBA Matrix
 * ------------------------------------------------------------------
 */
const saveMatrix = async (matrix) => {
  for (const row of matrix) {
    const existing = await COPOMapping.findOne({
      where: {
        courseOutcomeId: row.courseOutcomeId,
        programOutcomeId: row.programOutcomeId,
      },
    });

    if (existing) {
      await existing.update({
        mappingLevel: row.mappingLevel,
        status: true,
      });
    } else {
      await COPOMapping.create({
        courseOutcomeId: row.courseOutcomeId,
        programOutcomeId: row.programOutcomeId,
        mappingLevel: row.mappingLevel,
        status: true,
      });
    }
  }

  return true;
};

/**
 * ------------------------------------------------------------------
 * Update Mapping
 * ------------------------------------------------------------------
 */
const update = async (mapping, data) => {
  return await mapping.update(data);
};

/**
 * ------------------------------------------------------------------
 * Delete Mapping
 * ------------------------------------------------------------------
 */
const remove = async (mapping) => {
  return await mapping.destroy();
};

export default {
  create,
  findAll,
  findById,
  findByCourseOutcomeId,
  findByProgramOutcomeId,
  findExistingMapping,
  getMatrixData,
  saveMatrix,
  update,
  remove,
};