import {
  POAttainment,
  CourseOffering,
  ProgramOutcome,
} from "../../database/index.js";

const create = async (data) => {
  return await POAttainment.create(data);
};

const findAll = async () => {
  return await POAttainment.findAll({
    include: [
      {
        model: CourseOffering,
        as: "courseOffering",
      },
      {
        model: ProgramOutcome,
        as: "programOutcome",
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

const findById = async (id) => {
  return await POAttainment.findByPk(id, {
    include: [
      {
        model: CourseOffering,
        as: "courseOffering",
      },
      {
        model: ProgramOutcome,
        as: "programOutcome",
      },
    ],
  });
};

const findByCourseOfferingId = async (courseOfferingId) => {
  return await POAttainment.findAll({
    where: { courseOfferingId },
    include: [
      {
        model: ProgramOutcome,
        as: "programOutcome",
      },
    ],
  });
};

const findByProgramOutcomeId = async (programOutcomeId) => {
  return await POAttainment.findAll({
    where: { programOutcomeId },
    include: [
      {
        model: CourseOffering,
        as: "courseOffering",
      },
    ],
  });
};

const findExistingAttainment = async (courseOfferingId, programOutcomeId) => {
  return await POAttainment.findOne({
    where: {
      courseOfferingId,
      programOutcomeId,
    },
  });
};

const update = async (id, data) => {
  const attainment = await POAttainment.findByPk(id);

  if (!attainment) {
    return null;
  }

  await attainment.update(data);
  return await findById(id);
};

const remove = async (id) => {
  const attainment = await POAttainment.findByPk(id);

  if (!attainment) {
    return null;
  }

  await attainment.destroy();
  return true;
};

export default {
  create,
  findAll,
  findById,
  findByCourseOfferingId,
  findByProgramOutcomeId,
  findExistingAttainment,
  update,
  remove,
};