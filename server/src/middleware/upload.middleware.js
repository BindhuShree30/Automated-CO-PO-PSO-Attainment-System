import multer from "multer";
import ApiError from "../shared/errors/ApiError.js";

const storage = multer.memoryStorage();

// 1. Generic/PDF Upload for Syllabus & Industry Benchmarks (up to 15MB)
export const uploadPdf = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const isPdf =
      file.mimetype === "application/pdf" ||
      file.originalname.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return cb(new ApiError(400, "Only PDF files (.pdf) are allowed."));
    }

    cb(null, true);
  },
});

// 2. Excel Upload for Curriculum Import (up to 10MB)
export const uploadExcel = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    const isExcel =
      allowedMimeTypes.includes(file.mimetype) ||
      file.originalname.toLowerCase().endsWith(".xlsx") ||
      file.originalname.toLowerCase().endsWith(".xls");

    if (!isExcel) {
      return cb(
        new ApiError(400, "Only Excel files (.xlsx or .xls) are allowed.")
      );
    }

    cb(null, true);
  },
});

export default uploadExcel;