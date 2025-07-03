// Validate email format
export const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email && re.test(String(email).toLowerCase());
};

// Validate required field
export const validateRequired = (value) => {
  return value && value.trim() !== '';
};

// Validate minimum length
export const validateLength = (value, minLength) => {
  return value && value.length >= minLength;
};

// Validate password complexity
export const validatePasswordComplexity = (password) => {
  // At least one uppercase letter, one lowercase letter, one number
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
  return password && re.test(password);
};

// Validate matching passwords
export const validatePasswordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};
