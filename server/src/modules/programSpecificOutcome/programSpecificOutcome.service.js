import repository from "./programSpecificOutcome.repository.js";
import { Program } from "../../database/index.js";
import ApiError from "../../shared/errors/ApiError.js";

const create = async (payload) => {
  const program = await Program.findByPk(payload.programId);

  if (!program) {
    throw new ApiError(404, "Program not found.");
  }

  const existingPSO = await repository.findExistingPSO(
    payload.programId,
    payload.code
  );

  if (existingPSO) {
    throw new ApiError(
      409,
      "Program Specific Outcome code already exists for this program."
    );
  }

  return await repository.create(payload);
};

const findAll = async () => {
  return await repository.findAll();
};

const findById = async (id) => {
  const pso = await repository.findById(id);

  if (!pso) {
    throw new ApiError(404, "Program Specific Outcome not found.");
  }

  return pso;
};

const findByProgramId = async (programId) => {
  return await repository.findByProgramId(programId);
};

const update = async (id, payload) => {
  const pso = await repository.findById(id);

  if (!pso) {
    throw new ApiError(404, "Program Specific Outcome not found.");
  }

  if (
    payload.code &&
    payload.code !== pso.code
  ) {
    const existingPSO = await repository.findExistingPSO(
      payload.programId ?? pso.programId,
      payload.code
    );

    if (existingPSO && existingPSO.id !== id) {
      throw new ApiError(
        409,
        "Program Specific Outcome code already exists for this program."
      );
    }
  }

  return await repository.update(id, payload);
};

const remove = async (id) => {
  const pso = await repository.findById(id);

  if (!pso) {
    throw new ApiError(404, "Program Specific Outcome not found.");
  }

  await repository.remove(id);

  return {
    message: "Program Specific Outcome deleted successfully.",
  };
};

export default {
  create,
  findAll,
  findById,
  findByProgramId,
  update,
  remove,
};