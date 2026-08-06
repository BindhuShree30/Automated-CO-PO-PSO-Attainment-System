import { ProgramSpecificOutcome, Program } from "../../database/index.js";

const create = async (payload) => {
  return await ProgramSpecificOutcome.create(payload);
};

const findAll = async () => {
  return await ProgramSpecificOutcome.findAll({
    include: [
      {
        model: Program,
        as: "program",
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

const findById = async (id) => {
  return await ProgramSpecificOutcome.findByPk(id, {
    include: [
      {
        model: Program,
        as: "program",
      },
    ],
  });
};

const findByProgramId = async (programId) => {
  return await ProgramSpecificOutcome.findAll({
    where: { programId },
    include: [
      {
        model: Program,
        as: "program",
      },
    ],
    order: [["code", "ASC"]],
  });
};

const findExistingPSO = async (programId, code) => {
  return await ProgramSpecificOutcome.findOne({
    where: {
      programId,
      code,
    },
  });
};

const update = async (id, payload) => {
  await ProgramSpecificOutcome.update(payload, {
    where: { id },
  });

  return await findById(id);
};

const remove = async (id) => {
  return await ProgramSpecificOutcome.destroy({
    where: { id },
  });
};

export default {
  create,
  findAll,
  findById,
  findByProgramId,
  findExistingPSO,
  update,
  remove,
};