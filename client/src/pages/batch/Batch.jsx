/**
 * ------------------------------------------------------------------
 * Batch Management
 * Project : Automated CO–PO–PSO Attainment Analysis System
 * ------------------------------------------------------------------
 */

import { useEffect, useState } from "react";

import {
  ArrowLeft,
  Pencil,
  Plus,
  Trash,
} from "react-bootstrap-icons";

import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import {
  getBatches,
  deleteBatch,
} from "../../services/batchService";


function Batch() {
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);


  /**
   * --------------------------------------------------------------
   * Load Batches
   * --------------------------------------------------------------
   */
  const loadBatches = async () => {
    try {
      setLoading(true);

      const data = await getBatches();

      console.log(
        "BATCHES:",
        data
      );

      setBatches(data);

    } catch (error) {

      console.error(
        "Failed to load batches:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load batches."
      );

    } finally {
      setLoading(false);
    }
  };


  /**
   * --------------------------------------------------------------
   * Initial Load
   * --------------------------------------------------------------
   */
  useEffect(() => {
    loadBatches();
  }, []);


  /**
   * --------------------------------------------------------------
   * Delete Batch
   * --------------------------------------------------------------
   */
  const handleDelete = async (batch) => {

    const confirmed = window.confirm(
      `Are you sure you want to delete batch ${batch.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {

      await deleteBatch(batch.id);

      toast.success(
        "Batch deleted successfully."
      );

      await loadBatches();

    } catch (error) {

      console.error(
        "Failed to delete batch:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete batch."
      );
    }
  };


  /**
   * --------------------------------------------------------------
   * Loading
   * --------------------------------------------------------------
   */
  if (loading) {

    return (
      <div className="container py-5">

        <div className="text-center">

          Loading batches...

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

    <div className="container py-4">

      {/* =========================================================
          HEADER
      ========================================================= */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div className="d-flex align-items-center">

          <button
            type="button"
            className="btn btn-outline-secondary me-3"
            onClick={() => navigate(-1)}
          >

            <ArrowLeft size={20} />

          </button>


          <div>

            <h2 className="fw-bold mb-1">
              Batch Management
            </h2>

            <p className="text-muted mb-0">
              Manage academic batches.
            </p>

          </div>

        </div>


        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            navigate("/hod/batches/add")
          }
        >

          <Plus
            size={18}
            className="me-2"
          />

          Add Batch

        </button>

      </div>


      {/* =========================================================
          TABLE
      ========================================================= */}

      <div className="card shadow-sm border-0">

        <div className="card-body p-0">

          {batches.length === 0 ? (

            <div className="text-center py-5">

              <h5 className="text-muted">
                No batches found.
              </h5>

              <p className="text-muted">
                Create your first academic batch.
              </p>


              <button
                type="button"
                className="btn btn-primary"
                onClick={() =>
                  navigate("/hod/batches/add")
                }
              >

                <Plus
                  size={18}
                  className="me-2"
                />

                Add Batch

              </button>

            </div>

          ) : (

            <div className="table-responsive">

              <table className="table table-hover align-middle mb-0">

                <thead>

                  <tr>

                    <th className="px-4">
                      #
                    </th>

                    <th>
                      Batch
                    </th>

                    <th>
                      Start Year
                    </th>

                    <th>
                      End Year
                    </th>

                    <th>
                      Program
                    </th>

                    <th>
                      Status
                    </th>

                    <th className="text-end px-4">
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {batches.map(
                    (batch, index) => (

                      <tr key={batch.id}>

                        <td className="px-4">
                          {index + 1}
                        </td>


                        <td>

                          <strong>
                            {batch.name}
                          </strong>

                        </td>


                        <td>
                          {batch.startYear}
                        </td>


                        <td>
                          {batch.endYear}
                        </td>


                        <td>

                          {batch.program?.name ??
                            batch.programName ??
                            batch.program?.code ??
                            "-"}

                        </td>


                        <td>

                          {batch.status ? (

                            <span className="badge bg-success">
                              Active
                            </span>

                          ) : (

                            <span className="badge bg-secondary">
                              Inactive
                            </span>

                          )}

                        </td>


                        <td className="text-end px-4">

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary me-2"
                            title="Edit Batch"
                            onClick={() =>
                              navigate(
                                `/hod/batches/edit/${batch.id}`
                              )
                            }
                          >

                            <Pencil size={16} />

                          </button>


                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Delete Batch"
                            onClick={() =>
                              handleDelete(batch)
                            }
                          >

                            <Trash size={16} />

                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}


export default Batch;