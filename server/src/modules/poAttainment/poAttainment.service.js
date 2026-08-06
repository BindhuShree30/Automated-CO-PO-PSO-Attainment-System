import poAttainmentRepository from "./poAttainment.repository.js";
import coAttainmentRepository from "../coAttainment/coAttainment.repository.js";
import coPOMappingRepository from "../coPOMapping/coPOMapping.repository.js";
import programOutcomeRepository from "../programOutcome/programOutcome.repository.js";
import ApiError from "../../shared/errors/ApiError.js";

const createPOAttainment = async (data) => {
  const {
    courseOfferingId,
    programOutcomeId,
    attainmentValue,
    attainmentLevel,
    status,
  } = data;

  const programOutcome = await programOutcomeRepository.findById(
    programOutcomeId
  );

  if (!programOutcome) {
    throw new ApiError(404, "Program Outcome not found.");
  }

  const existing =
    await poAttainmentRepository.findExistingAttainment(
      courseOfferingId,
      programOutcomeId
    );

  if (existing) {
    throw new ApiError(
      409,
      "PO Attainment already exists for this Course Offering and Program Outcome."
    );
  }

  return await poAttainmentRepository.create({
    courseOfferingId,
    programOutcomeId,
    attainmentValue,
    attainmentLevel,
    status,
  });
};

const calculatePOAttainment = async (
  courseOfferingId,
  programOutcomeId
) => {
  const mappings =
    await coPOMappingRepository.findByProgramOutcomeId(
      programOutcomeId
    );

  if (!mappings.length) {
    throw new ApiError(
      404,
      "No CO-PO mappings found for this Program Outcome."
    );
  }

  let weightedSum = 0;
  let totalMapping = 0;

  for (const mapping of mappings) {
    const coAttainments =
      await coAttainmentRepository.findByCourseOutcomeId(
        mapping.courseOutcomeId
      );

    const attainment = coAttainments.find(
      (item) =>
        item.courseOfferingId === courseOfferingId
    );

    if (!attainment) {
      continue;
    }

    weightedSum +=
      Number(attainment.attainmentPercentage) *
      Number(mapping.mappingLevel);

    totalMapping += Number(mapping.mappingLevel);
  }

  if (totalMapping === 0) {
    throw new ApiError(
      400,
      "Unable to calculate PO Attainment."
    );
  }

  const attainmentValue = Number(
    (weightedSum / totalMapping).toFixed(2)
  );

  let attainmentLevel = 1;

  if (attainmentValue >= 70) {
    attainmentLevel = 3;
  } else if (attainmentValue >= 50) {
    attainmentLevel = 2;
  }

  const existing =
    await poAttainmentRepository.findExistingAttainment(
      courseOfferingId,
      programOutcomeId
    );

  if (existing) {
    return await poAttainmentRepository.update(existing.id, {
      attainmentValue,
      attainmentLevel,
    });
  }

  return await poAttainmentRepository.create({
    courseOfferingId,
    programOutcomeId,
    attainmentValue,
    attainmentLevel,
    status: true,
  });
};

const getPOAttainments = async () => {
  return await poAttainmentRepository.findAll();
};

const getPOAttainmentById = async (id) => {
  const attainment =
    await poAttainmentRepository.findById(id);

  if (!attainment) {
    throw new ApiError(404, "PO Attainment not found.");
  }

  return attainment;
};

const updatePOAttainment = async (id, data) => {
  const attainment =
    await poAttainmentRepository.update(id, data);

  if (!attainment) {
    throw new ApiError(404, "PO Attainment not found.");
  }

  return attainment;
};

const deletePOAttainment = async (id) => {
  const deleted =
    await poAttainmentRepository.remove(id);

  if (!deleted) {
    throw new ApiError(404, "PO Attainment not found.");
  }

  return true;
};

export default {
  createPOAttainment,
  calculatePOAttainment,
  getPOAttainments,
  getPOAttainmentById,
  updatePOAttainment,
  deletePOAttainment,
};