/**
 * ------------------------------------------------------------------
 * Batch Form
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Save,
} from "react-bootstrap-icons";

import toast from "react-hot-toast";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../api/axios";

import {
  createBatch,
  getBatchById,
  updateBatch,
} from "../../services/batchService";


function BatchForm() {

  const navigate = useNavigate();

  const { id } = useParams();

  const isEditMode = Boolean(id);


  const [programs, setPrograms] = useState([]);

  const [selectedProgram, setSelectedProgram] =
    useState(null);


  const [formData, setFormData] = useState({

    programId: "",

    startYear: "",

    endYear: "",

    status: true,

  });


  const [loadingPrograms, setLoadingPrograms] =
    useState(true);


  const [loadingBatch, setLoadingBatch] =
    useState(false);


  const [isSubmitting, setIsSubmitting] =
    useState(false);


  /**
   * --------------------------------------------------------------
   * Load Programs
   * --------------------------------------------------------------
   */
  useEffect(() => {

    const loadPrograms = async () => {

      try {

        setLoadingPrograms(true);

        const response =
          await api.get("/programs");

        const data =
          response.data?.data ?? [];

        console.log(
          "PROGRAMS:",
          data
        );

        setPrograms(data);

      } catch (error) {

        console.error(
          "Failed to load programs:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to load programs."
        );

      } finally {

        setLoadingPrograms(false);

      }

    };


    loadPrograms();

  }, []);


  /**
   * --------------------------------------------------------------
   * Load Batch When Editing
   * --------------------------------------------------------------
   */
  useEffect(() => {

    if (!isEditMode) {
      return;
    }


    const loadBatch = async () => {

      try {

        setLoadingBatch(true);

        const batch =
          await getBatchById(id);


        if (!batch) {

          toast.error(
            "Batch not found."
          );

          navigate("/hod/batches");

          return;
        }


        setFormData({

          programId:
            batch.programId ?? "",

          startYear:
            batch.startYear ?? "",

          endYear:
            batch.endYear ?? "",

          status:
            batch.status ?? true,

        });

      } catch (error) {

        console.error(
          "Failed to load batch:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to load batch."
        );

      } finally {

        setLoadingBatch(false);

      }

    };


    loadBatch();

  }, [
    id,
    isEditMode,
    navigate,
  ]);


  /**
   * --------------------------------------------------------------
   * Find Selected Program
   * --------------------------------------------------------------
   */
  useEffect(() => {

    if (!formData.programId) {

      setSelectedProgram(null);

      return;
    }


    const program =
      programs.find(
        (item) =>
          item.id ===
          formData.programId
      );


    setSelectedProgram(
      program ?? null
    );

  }, [
    formData.programId,
    programs,
  ]);


  /**
   * --------------------------------------------------------------
   * Handle Input
   * --------------------------------------------------------------
   */
  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  };


  /**
   * --------------------------------------------------------------
   * Expected End Year
   * --------------------------------------------------------------
   */
  const expectedEndYear =
    selectedProgram &&
    formData.startYear
      ? Number(
          formData.startYear
        ) +
        Number(
          selectedProgram.duration
        )
      : "";


  /**
   * --------------------------------------------------------------
   * Submit
   * --------------------------------------------------------------
   */
  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    if (!formData.programId) {

      toast.error(
        "Please select a program."
      );

      return;
    }


    if (!formData.startYear) {

      toast.error(
        "Please enter the start year."
      );

      return;
    }


    if (!formData.endYear) {

      toast.error(
        "Please enter the end year."
      );

      return;
    }


    const startYear =
      Number(
        formData.startYear
      );


    const endYear =
      Number(
        formData.endYear
      );


    if (
      !Number.isInteger(
        startYear
      ) ||
      !Number.isInteger(
        endYear
      )
    ) {

      toast.error(
        "Years must be valid integers."
      );

      return;
    }


    if (startYear < 2000) {

      toast.error(
        "Start year must be at least 2000."
      );

      return;
    }


    if (endYear <= startYear) {

      toast.error(
        "End year must be greater than start year."
      );

      return;
    }


    /**
     * ------------------------------------------------------------
     * Dynamic Program Duration Validation
     * ------------------------------------------------------------
     */

    if (selectedProgram) {

      const requiredEndYear =
        startYear +
        Number(
          selectedProgram.duration
        );


      if (
        endYear !==
        requiredEndYear
      ) {

        toast.error(
          `For ${selectedProgram.name}, the batch must be ${startYear}-${requiredEndYear}.`
        );

        return;
      }

    }


    const payload = {

      programId:
        formData.programId,

      startYear,

      endYear,

      status:
        Boolean(
          formData.status
        ),

    };


    try {

      setIsSubmitting(true);


      console.log(
        "BATCH PAYLOAD:",
        payload
      );


      if (isEditMode) {

        await updateBatch(
          id,
          payload
        );


        toast.success(
          "Batch updated successfully."
        );

      } else {

        await createBatch(
          payload
        );


        toast.success(
          "Batch created successfully."
        );

      }


      navigate("/hod/batches");

    } catch (error) {

      console.error(
        "Failed to save batch:",
        error
      );


      toast.error(
        error.response?.data?.message ||
          "Failed to save batch."
      );

    } finally {

      setIsSubmitting(false);

    }

  };


  /**
   * --------------------------------------------------------------
   * Loading
   * --------------------------------------------------------------
   */
  if (
    loadingPrograms ||
    loadingBatch
  ) {

    return (

      <div className="container py-5">

        <div className="text-center">

          Loading...

        </div>

      </div>

    );
  }


  /**
   * --------------------------------------------------------------
   * UI
   * --------------------------------------------------------------
   */
  return (

    <div
      className="container py-4"
      style={{
        maxWidth: "900px",
      }}
    >

      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="d-flex align-items-center mb-4">

        <button
          type="button"
          className="btn btn-outline-secondary me-3"
          onClick={() =>
            navigate(
              "/hod/batches"
            )
          }
        >

          <ArrowLeft size={20} />

        </button>


        <div>

          <h2 className="fw-bold mb-1">

            {isEditMode
              ? "Edit Batch"
              : "Add Batch"}

          </h2>


          <p className="text-muted mb-0">

            {isEditMode
              ? "Update the batch details."
              : "Create a new academic batch."}

          </p>

        </div>

      </div>


      {/* =========================================================
          FORM CARD
      ========================================================= */}

      <div className="card shadow-sm border-0">

        <div className="card-body p-4">

          <form
            onSubmit={
              handleSubmit
            }
          >

            {/* =================================================
                PROGRAM
            ================================================= */}

            <div className="mb-4">

              <label
                htmlFor="programId"
                className="form-label fw-semibold"
              >
                Program
              </label>


              <select
                id="programId"
                name="programId"
                className="form-select"
                value={
                  formData.programId
                }
                onChange={
                  handleChange
                }
              >

                <option value="">
                  Select Program
                </option>


                {programs.map(
                  (program) => (

                    <option
                      key={program.id}
                      value={program.id}
                    >

                      {program.name}

                      {program.code
                        ? ` (${program.code})`
                        : ""}

                    </option>

                  )
                )}

              </select>


              {programs.length ===
                0 && (

                <small className="text-danger">

                  No programs available.

                </small>

              )}

            </div>


            {/* =================================================
                YEARS
            ================================================= */}

            <div className="row">

              <div className="col-md-6 mb-4">

                <label
                  htmlFor="startYear"
                  className="form-label fw-semibold"
                >
                  Start Year
                </label>


                <input
                  id="startYear"
                  name="startYear"
                  type="number"
                  className="form-control"
                  placeholder="Example: 2023"
                  value={
                    formData.startYear
                  }
                  onChange={
                    handleChange
                  }
                  min="2000"
                  max="2100"
                />

              </div>


              <div className="col-md-6 mb-4">

                <label
                  htmlFor="endYear"
                  className="form-label fw-semibold"
                >
                  End Year
                </label>


                <input
                  id="endYear"
                  name="endYear"
                  type="number"
                  className="form-control"
                  placeholder="Example: 2027"
                  value={
                    formData.endYear
                  }
                  onChange={
                    handleChange
                  }
                  min="2001"
                  max="2110"
                />

              </div>

            </div>


            {/* =================================================
                PROGRAM INFORMATION
            ================================================= */}

            {selectedProgram && (

              <div className="alert alert-info">

                <strong>
                  Program:
                </strong>{" "}

                {selectedProgram.name}

                <br />


                <strong>
                  Duration:
                </strong>{" "}

                {
                  selectedProgram.duration
                }{" "}

                years


                {formData.startYear && (

                  <>

                    <br />

                    <strong>
                      Expected Batch:
                    </strong>{" "}

                    {formData.startYear}
                    -
                    {expectedEndYear}

                  </>

                )}

              </div>

            )}


            {/* =================================================
                STATUS
            ================================================= */}

            {isEditMode && (

              <div className="form-check form-switch mb-4">

                <input
                  id="status"
                  name="status"
                  type="checkbox"
                  className="form-check-input"
                  checked={
                    formData.status
                  }
                  onChange={(
                    event
                  ) =>
                    setFormData(
                      (
                        previous
                      ) => ({
                        ...previous,
                        status:
                          event.target
                            .checked,
                      })
                    )
                  }
                />


                <label
                  htmlFor="status"
                  className="form-check-label"
                >
                  Active Batch
                </label>

              </div>

            )}


            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="d-flex justify-content-end gap-2">

              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  navigate(
                    "/hod/batches"
                  )
                }
                disabled={
                  isSubmitting
                }
              >
                Cancel
              </button>


              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  isSubmitting ||
                  programs.length === 0
                }
              >

                <Save
                  size={18}
                  className="me-2"
                />


                {isSubmitting
                  ? "Saving..."
                  : isEditMode
                  ? "Update Batch"
                  : "Create Batch"}

              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}


export default BatchForm;