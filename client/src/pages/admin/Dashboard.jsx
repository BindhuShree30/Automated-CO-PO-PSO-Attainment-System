import { useEffect, useState } from "react";
import { getAdminDashboard } from "../../services/dashboardService";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await getAdminDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error("Failed to load dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container mt-4">Loading...</div>;
  }
  
  if (!dashboard) {
    return (
      <div className="container mt-4">
        <h4>Failed to load dashboard data.</h4>
      </div>
    );
  }

  const cards = [
    { title: "Departments", value: dashboard.departments },
    { title: "Programs", value: dashboard.programs },
    { title: "Faculty", value: dashboard.faculty },
    { title: "Students", value: dashboard.students },
    { title: "Courses", value: dashboard.courses },
    { title: "Course Outcomes", value: dashboard.courseOutcomes },
    { title: "Program Outcomes", value: dashboard.programOutcomes },
    { title: "PSOs", value: dashboard.programSpecificOutcomes },
  ];

  return (
    <div className="container-fluid mt-4">
      <h2 className="mb-4 fw-bold">Admin Dashboard</h2>

      <div className="row g-4">
        {cards.map((card) => (
          <div className="col-lg-3 col-md-6" key={card.title}>
            <div className="card shadow-sm border-0">
              <div className="card-body text-center">
                <h6 className="text-muted">{card.title}</h6>
                <h2 className="fw-bold text-primary">{card.value}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;