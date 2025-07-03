import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/authContext";
import { validateRequired } from "../utils/validation";


export default function Login() {
  const [location, setLocation] = useLocation();
  const { login, user } = useAuth();
  
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  
  const [errors, setErrors] = useState({
    username: "",
    password: "",
    form: ""
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "Admin") {
        setLocation("/admin");
      } else if (user.role === "buyer") {
        setLocation("/browse")
      }else {
        setLocation("/welcome");
      }
    }
  }, [user, setLocation]);

  // //
  // useEffect(() => {
  //   console.log("👤 Current user from context:", user);
  // }, [user]);
  // //
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear errors when typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      username: "",
      password: "",
      form: ""
    };
    
    // Validate username
    if (!validateRequired(formData.username)) {
      newErrors.username = "Please enter your username";
      isValid = false;
    }
    
    // Validate password
    if (!validateRequired(formData.password)) {
      newErrors.password = "Password is required";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (validateForm()) {
      const success = await login(formData);
  
      if (!success) {
        setErrors({
          ...errors,
          form: "Invalid credentials or your artist account may not be approved yet."
        });
      }
    }
  };
  

  const navigateToRegister = (e) => {
    e.preventDefault();
    setLocation("/register");
  };

  return (
    <div className="container">
      <div className="card auth-card">
        <h1 className="auth-title">Log In</h1>
        
        {errors.form && (
          <div className="error-banner">
            <i className="ri-error-warning-line"></i>
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username"
              className={`form-input ${errors.username ? 'input-error' : ''}`}
              placeholder="Your username" 
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <div className="form-error">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Your password" 
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <button type="submit" className="btn btn-primary btn-block">
              Log In
            </button>
          </div>
          
          <div className="auth-alternate">
            Don't have an account? 
            <a href="/register" className="auth-link" onClick={navigateToRegister}>Register</a>
          </div>
        </form>
      </div>
    </div>
  );
}
