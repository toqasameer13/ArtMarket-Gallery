import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/authContext";
import { validateRequired, validateLength } from "../utils/validation";

export default function Register() {
  const [location, setLocation] = useLocation();
  const { register, user } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "",
    address: "",
    bio: ""
  });
  
  const [errors, setErrors] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    role: "",
    address: "",
    bio: "",
    form: ""
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/welcome");
      }
    }
  }, [user, setLocation]);

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

  const handleRoleChange = (e) => {
    handleChange(e);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: "",
      username: "",
      email: "",
      password: "",
      role: "",
      address: "",
      bio: "",
      form: ""
    };
    
    // Validate name
    if (!validateRequired(formData.fullName)) {
      newErrors.fullName = "Name is required";
      isValid = false;
    }
    
    // Validate username
    if (!validateRequired(formData.username)) {
      newErrors.username = "Username is required";
      isValid = false;
    } else if (!validateLength(formData.username, 3)) {
      newErrors.username = "Username must be at least 3 characters";
      isValid = false;
    }
    
    // Validate email
    if (!validateRequired(formData.email)) {
      newErrors.email = "Email is required";
      isValid = false;
    }
    
    // Validate password
    if (!validateLength(formData.password, 6)) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
      isValid = false;
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
      isValid = false;
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one special character (!@#$%^&*)";
      isValid = false;
    }
    
    
    // Validate role
    if (!validateRequired(formData.role)) {
      newErrors.role = "Please select a role";
      isValid = false;
    }
    
    // Validate conditional fields
    if (formData.role === "Buyer" && !validateRequired(formData.address)) {
      newErrors.address = "Address is required";
      isValid = false;
    }
    
    if (formData.role === "Artist" && !validateRequired(formData.bio)) {
      newErrors.bio = "Bio is required";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (validateForm()) {
      const result = await register(formData);
  
      if (result.success) {
        setLocation("/login");
      } else {
        setErrors({
          ...errors,
          form: result.message 
        });
      }
    }
  };
  
  

  const navigateToLogin = (e) => {
    e.preventDefault();
    setLocation("/login");
  };

  return (
    <div className="container">
      <div className="card auth-card">
        <h1 className="auth-title">Create Account</h1>
        
        {errors.form && (
          <div className="error-banner">
            <i className="ri-error-warning-line"></i>
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">Full Name</label>
            <input 
              type="text" 
              id="fullName" 
              name="fullName"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="John Doe" 
              value={formData.name}
              onChange={handleChange}
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input 
              type="text" 
              id="username" 
              name="username"
              className={`form-input ${errors.username ? 'input-error' : ''}`}
              placeholder="johndoe" 
              value={formData.username}
              onChange={handleChange}
            />
            {errors.username && <div className="form-error">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email"
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com" 
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              placeholder="Choose a strong password" 
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="role" className="form-label">Role</label>
            <select 
              id="role" 
              name="role"
              className={`form-input ${errors.role ? 'input-error' : ''}`}
              value={formData.role}
              onChange={handleRoleChange}
            >
              <option value="">Select your role</option>
              <option value="Buyer">Buyer</option>
              <option value="Artist">Artist</option>
            </select>
            {errors.role && <div className="form-error">{errors.role}</div>}
          </div>
          
          {/* Conditional fields based on role */}
          {formData.role === "Buyer" && (
            <div className="form-group">
              <label htmlFor="address" className="form-label">Address</label>
              <textarea 
                id="address" 
                name="address"
                className={`form-input ${errors.address ? 'input-error' : ''}`}
                placeholder="Your shipping address" 
                rows="3"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
              {errors.address && <div className="form-error">{errors.address}</div>}
            </div>
          )}
          
          {formData.role === "Artist" && (
            <div className="form-group">
              <label htmlFor="bio" className="form-label">Bio</label>
              <textarea 
                id="bio" 
                name="bio"
                className={`form-input ${errors.bio ? 'input-error' : ''}`}
                placeholder="Tell us about yourself and your art" 
                rows="3"
                value={formData.bio}
                onChange={handleChange}
              ></textarea>
              {errors.bio && <div className="form-error">{errors.bio}</div>}
            </div>
          )}
          
          <div className="form-group">
            <button type="submit" className="btn btn-primary btn-block">
              Create Account
            </button>
          </div>
          
          <div className="auth-alternate">
            Already have an account? 
            <a href="/login" className="auth-link" onClick={navigateToLogin}>Log In</a>
          </div>
        </form>
      </div>
    </div>
  );
}
