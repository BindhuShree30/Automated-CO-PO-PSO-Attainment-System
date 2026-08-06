import {
    CoPsoMapping,
    CourseOutcome,
    ProgramSpecificOutcome,
  } from "../../database/index.js";
  
  class CoPsoMappingRepository {
    async create(data) {
      return await CoPsoMapping.create(data);
    }
  
    async findAll() {
      return await CoPsoMapping.findAll({
        include: [
          {
            model: CourseOutcome,
            as: "courseOutcome",
            attributes: ["id", "code", "description"],
          },
          {
            model: ProgramSpecificOutcome,
            as: "programSpecificOutcome",
            attributes: ["id", "code", "description"],
          },
        ],
        order: [["createdAt", "DESC"]],
      });
    }
  
    async findById(id) {
      return await CoPsoMapping.findByPk(id, {
        include: [
          {
            model: CourseOutcome,
            as: "courseOutcome",
            attributes: ["id", "code", "description"],
          },
          {
            model: ProgramSpecificOutcome,
            as: "programSpecificOutcome",
            attributes: ["id", "code", "description"],
          },
        ],
      });
    }
  
    async findByCourseOutcomeId(courseOutcomeId) {
      return await CoPsoMapping.findAll({
        where: { courseOutcomeId },
        include: [
          {
            model: ProgramSpecificOutcome,
            as: "programSpecificOutcome",
            attributes: ["id", "code", "description"],
          },
        ],
      });
    }
  
    async findByProgramSpecificOutcomeId(programSpecificOutcomeId) {
      return await CoPsoMapping.findAll({
        where: { programSpecificOutcomeId },
        include: [
          {
            model: CourseOutcome,
            as: "courseOutcome",
            attributes: ["id", "code", "description"],
          },
        ],
      });
    }
  
    async findExistingMapping(courseOutcomeId, programSpecificOutcomeId) {
      return await CoPsoMapping.findOne({
        where: {
          courseOutcomeId,
          programSpecificOutcomeId,
        },
      });
    }
  
    async update(mapping, data) {
      return await mapping.update(data);
    }
  
    async remove(mapping) {
      return await mapping.destroy();
    }
  }
  
  export default new CoPsoMappingRepository();