import { Link, useLocation } from "wouter";
import { useAuth } from "../context/authContext";

export default function Navbar() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <i className="ri-palette-line"></i>
          ArtMarket
        </div>
        
        {!user && (
          <div className="navbar-menu">
            <Link href="/login" className={`navbar-link ${location === '/login' ? 'active' : ''}`}>
              Login
            </Link>
            <Link href="/register" className={`navbar-link ${location === '/register' ? 'active' : ''}`}>
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
