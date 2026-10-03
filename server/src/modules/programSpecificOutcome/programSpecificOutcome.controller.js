import programSpecificOutcomeService from "./programSpecificOutcome.service.js";

const createProgramSpecificOutcome = async (req, res, next) => {
  try {
    const result = await programSpecificOutcomeService.create(
      req.validatedData.body
    );

    res.status(201).json({
      success: true,
      message: "Program Specific Outcome created successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getProgramSpecificOutcomes = async (req, res, next) => {
  try {
    const result = await programSpecificOutcomeService.findAll();

    res.status(200).json({
      success: true,
      message: "Program Specific Outcomes fetched successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getProgramSpecificOutcomeById = async (req, res, next) => {
  try {
    const { id } = req.validatedData.params;

    const result = await programSpecificOutcomeService.findById(id);

    res.status(200).json({
      success: true,
      message: "Program Specific Outcome fetched successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getProgramSpecificOutcomesByProgramId = async (req, res, next) => {
  try {
    const { programId } = req.validatedData.params;

    const result =
      await programSpecificOutcomeService.findByProgramId(programId);

    res.status(200).json({
      success: true,
      message: "Program Specific Outcomes fetched successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateProgramSpecificOutcome = async (req, res, next) => {
  try {
    const { id } = req.validatedData.params;

    const result = await programSpecificOutcomeService.update(
      id,
      req.validatedData.body
    );

    res.status(200).json({
      success: true,
      message: "Program Specific Outcome updated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProgramSpecificOutcome = async (req, res, next) => {
  try {
    const { id } = req.validatedData.params;

    const result = await programSpecificOutcomeService.remove(id);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createProgramSpecificOutcome,
  getProgramSpecificOutcomes,
  getProgramSpecificOutcomeById,
  getProgramSpecificOutcomesByProgramId,
  updateProgramSpecificOutcome,
  deleteProgramSpecificOutcome,
};