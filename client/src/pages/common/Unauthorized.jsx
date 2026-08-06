import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="container text-center mt-5">
      <h1>403</h1>

      <h3>Unauthorized Access</h3>

      <p>
        You don't have permission to access this page.
      </p>

      <Link
        to="/login"
        className="btn btn-primary"
      >
        Back to Login
      </Link>
    </div>
  );
}

export default Unauthorized;