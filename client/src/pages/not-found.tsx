import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="container">
      <div className="card">
        <div className="card-content">
          <div className="error-header">
            <i className="ri-alert-circle-line error-icon"></i>
            <h1 className="error-title">404 Page Not Found</h1>
          </div>
          
          <p className="error-message">
            The page you are looking for doesn't exist or has been moved.
          </p>
          
          <div className="error-actions">
            <Link href="/login">
              <button className="btn btn-primary">
                <i className="ri-home-line"></i> Back to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
