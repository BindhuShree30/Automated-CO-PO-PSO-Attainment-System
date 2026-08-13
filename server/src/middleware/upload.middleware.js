import multer from "multer";
import ApiError from "../shared/errors/ApiError.js";

const storage = multer.memoryStorage();

const upload = multer({
    storage,

    limits: {
        fileSize: 5 * 1024 * 1024,
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
                new ApiError(
                    400,
                    "Only Excel files (.xlsx or .xls) are allowed."
                )
            );
        }

        cb(null, true);
    },
});

export default upload;