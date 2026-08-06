import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useDepartments } from "../../hooks/useDepartments";

import {
  useCourse,
  useUpdateCourse,
} from "../../hooks/useCourses";

import { usePrograms } from "../../hooks/usePrograms";

function EditCourse() {

  const { id } = useParams();
  const navigate = useNavigate();

  const { data: course } = useCourse(id);
 // const { data: programs = [] } = usePrograms();
  const { data: departments = [] } = useDepartments();

  const updateCourse = useUpdateCourse();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    credits: 3,
    semester: 1,
    departmentId:"",
    programId: "",
    status: true,
  });

  useEffect(() => {

    if (course) {

      setFormData({
        code: course.code || "",
        name: course.name || "",
        credits: course.credits || 3,
        semester: course.semester || 1,
        departmentId: course.departmentId || "",
        //programId: course.programId || "",
        status: course.status,
      });

    }

  }, [course]);

  const handleChange = (e) => {

    const { name, value, type, checked } =
      e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : ["credits", "semester"].includes(name)
          ? Number(value)
          : value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await updateCourse.mutateAsync({
        id,
        data: formData,
      });

      toast.success(
        "Course updated successfully."
      );

      navigate("/admin/courses");

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
          "Unable to update course."
      );

    }

  };

  return (

    <div className="container-fluid mt-4">

      <div className="card shadow-sm">

        <div className="card-header">
          <h4>Edit Course</h4>
        </div>

        <div className="card-body">

          <form onSubmit={handleSubmit}>

            <div className="row">

              <div className="col-md-6 mb-3">

                <label>Course Code</label>

                <input
                  className="form-control"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="col-md-6 mb-3">

                <label>Course Name</label>

                <input
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="col-md-6 mb-3">

                <label>Credits</label>

                <input
                  type="number"
                  className="form-control"
                  name="credits"
                  value={formData.credits}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="col-md-6 mb-3">

                <label>Semester</label>

                <input
                  type="number"
                  className="form-control"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="col-md-6 mb-3">
              

                <label>Department</label>

                <select
                  className="form-select"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select Department
                  </option>

                  {departments.map((department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.code} - {department.name}
                    </option>
                  ))}

                </select>

              
                

              </div>

              <div className="col-md-6 mb-3">

                <label>Status</label>

                <select
                  className="form-select"
                  name="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status:
                        e.target.value === "true",
                    })
                  }
                >

                  <option value={true}>
                    Active
                  </option>

                  <option value={false}>
                    Inactive
                  </option>

                </select>

              </div>

            </div>

            <button
              className="btn btn-primary"
              disabled={updateCourse.isPending}
            >
              {updateCourse.isPending
                ? "Updating..."
                : "Update Course"}
            </button>

          </form>

        </div>

      </div>

    </div>

  );
}

export default EditCourse;