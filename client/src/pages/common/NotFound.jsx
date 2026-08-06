import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container text-center mt-5">
      <h1>404</h1>

      <h3>Page Not Found</h3>

      <Link
        to="/login"
        className="btn btn-primary mt-3"
      >
        Go to Login
      </Link>
    </div>
  );
}

export default NotFound;