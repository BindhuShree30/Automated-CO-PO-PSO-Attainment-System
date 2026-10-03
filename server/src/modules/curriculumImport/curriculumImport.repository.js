/**
 * ------------------------------------------------------------------
 * Curriculum Import Repository
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 *
 * Handles database access for:
 *
 * Curriculum
 * Curriculum Import
 * Curriculum Import Rows
 *
 * No business logic is placed here.
 * ------------------------------------------------------------------
 */

import CurriculumImport from "../../database/models/CurriculumImport.js";
import CurriculumImportRow from "../../database/models/CurriculumImportRow.js";
import Curriculum from "../../database/models/Curriculum.js";
import Course from "../../database/models/Course.js";
import User from "../../database/models/User.js";

/**
 * ------------------------------------------------------------------
 * Create Curriculum Import
 * ------------------------------------------------------------------
 */
const createImport = async (
  data,
  options = {}
) => {
  return CurriculumImport.create(
    data,
    options
  );
};

/**
 * ------------------------------------------------------------------
 * Find Curriculum Import By ID
 * ------------------------------------------------------------------
 */
const findImportById = async (
  id
) => {
  return CurriculumImport.findByPk(
    id,
    {
      include: [
        {
          model: Curriculum,
          as: "curriculum",
          attributes: [
            "id",
            "name",
            "code",
            "regulationYear",
            "duration",
            "status",
          ],
        },

        {
          model: User,
          as: "uploadedByUser",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "role",
          ],
        },

        {
          model: CurriculumImportRow,
          as: "rows",
          include: [
            {
              model: Course,
              as: "matchedCourse",
              attributes: [
                "id",
                "code",
                "name",
                "credits",
                "semester",
                "status",
              ],
            },
          ],
        },
      ],
      order: [
        [
          {
            model: CurriculumImportRow,
            as: "rows",
          },
          "semesterNumber",
          "ASC",
        ],
        [
          {
            model: CurriculumImportRow,
            as: "rows",
          },
          "sequenceNo",
          "ASC",
        ],
      ],
    }
  );
};

/**
 * ------------------------------------------------------------------
 * Find All Imports For Curriculum
 * ------------------------------------------------------------------
 */
const findImportsByCurriculumId =
  async (
    curriculumId
  ) => {
    return CurriculumImport.findAll({
      where: {
        curriculumId,
      },

      include: [
        {
          model: Curriculum,
          as: "curriculum",
          attributes: [
            "id",
            "name",
            "code",
            "regulationYear",
            "duration",
            "status",
          ],
        },

        {
          model: User,
          as: "uploadedByUser",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "role",
          ],
        },
      ],

      order: [
        ["createdAt", "DESC"],
      ],
    });
  };

/**
 * ------------------------------------------------------------------
 * Update Curriculum Import
 * ------------------------------------------------------------------
 */
const updateImport = async (
  id,
  data,
  options = {}
) => {
  const curriculumImport =
    await CurriculumImport.findByPk(
      id
    );

  if (!curriculumImport) {
    return null;
  }

  return curriculumImport.update(
    data,
    options
  );
};

/**
 * ------------------------------------------------------------------
 * Delete Curriculum Import
 * ------------------------------------------------------------------
 */
const deleteImport = async (
  id
) => {
  const curriculumImport =
    await CurriculumImport.findByPk(
      id
    );

  if (!curriculumImport) {
    return null;
  }

  await curriculumImport.destroy();

  return true;
};

/**
 * ------------------------------------------------------------------
 * Create One Curriculum Import Row
 * ------------------------------------------------------------------
 */
const createImportRow = async (
  data,
  transaction = null
) => {
  return CurriculumImportRow.create(
    data,
    {
      transaction,
    }
  );
};

/**
 * ------------------------------------------------------------------
 * Create Multiple Curriculum Import Rows
 * ------------------------------------------------------------------
 */
const bulkCreateImportRows =
  async (
    data,
    transaction = null
  ) => {
    return CurriculumImportRow.bulkCreate(
      data,
      {
        transaction,
      }
    );
  };

/**
 * ------------------------------------------------------------------
 * Find Curriculum Import Rows
 * ------------------------------------------------------------------
 */
const findImportRows = async (
  importId
) => {
  return CurriculumImportRow.findAll({
    where: {
      importId,
    },

    include: [
      {
        model: Course,
        as: "matchedCourse",
        attributes: [
          "id",
          "code",
          "name",
          "credits",
          "semester",
          "status",
        ],
      },
    ],

    order: [
      ["semesterNumber", "ASC"],
      ["sequenceNo", "ASC"],
      ["sourceRowNumber", "ASC"],
    ],
  });
};

/**
 * ------------------------------------------------------------------
 * Find Curriculum Import Row By ID
 * ------------------------------------------------------------------
 */
const findImportRowById = async (
  id
) => {
  return CurriculumImportRow.findByPk(
    id,
    {
      include: [
        {
          model: Course,
          as: "matchedCourse",
          attributes: [
            "id",
            "code",
            "name",
            "credits",
            "semester",
            "status",
          ],
        },
      ],
    }
  );
};

/**
 * ------------------------------------------------------------------
 * Update Curriculum Import Row
 * ------------------------------------------------------------------
 */
const updateImportRow = async (
  id,
  data,
  options = {}
) => {
  const row =
    await CurriculumImportRow.findByPk(
      id
    );

  if (!row) {
    return null;
  }

  return row.update(
    data,
    options
  );
};

/**
 * ------------------------------------------------------------------
 * Delete Curriculum Import Row
 * ------------------------------------------------------------------
 */
const deleteImportRow = async (
  id
) => {
  const row =
    await CurriculumImportRow.findByPk(
      id
    );

  if (!row) {
    return null;
  }

  await row.destroy();

  return true;
};

/**
 * ------------------------------------------------------------------
 * Delete All Rows For Import
 * ------------------------------------------------------------------
 */
const deleteRowsByImportId =
  async (
    importId,
    transaction = null
  ) => {
    return CurriculumImportRow.destroy(
      {
        where: {
          importId,
        },

        transaction,
      }
    );
  };

/**
 * ------------------------------------------------------------------
 * Export Repository
 * ------------------------------------------------------------------
 */
export default {
  createImport,
  findImportById,
  findImportsByCurriculumId,
  updateImport,
  deleteImport,

  createImportRow,
  bulkCreateImportRows,
  findImportRows,
  findImportRowById,
  updateImportRow,
  deleteImportRow,
  deleteRowsByImportId,
};