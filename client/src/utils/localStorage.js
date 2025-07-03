// Initialize localStorage with default values if empty for users
const initializeUsersStorage = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
  }
};

// Get all users
export const getUsers = () => {
  initializeUsersStorage();
  return JSON.parse(localStorage.getItem('users') || '[]');
};

// Get a user by ID
export const getUser = (id) => {
  const users = getUsers();
  return users.find(user => user.id === id);
};

// Get a user by username
export const getUserByUsername = (username) => {
  const users = getUsers();
  return users.find(user => user.username === username);
};

// Get a user by email (kept for backward compatibility)
export const getUserByEmail = (email) => {
  const users = getUsers();
  return users.find(user => user.email === email);
};

// Add a new user
export const addUser = (user) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
  return user;
};

// Update a user
export const updateUser = (id, updatedData) => {
  const users = getUsers();
  const index = users.findIndex(user => user.id === id);
  
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedData };
    localStorage.setItem('users', JSON.stringify(users));
    return users[index];
  }
  
  return null;
};

// Update user status (for artists)
export const updateUserStatus = (id, status) => {
  return updateUser(id, { status });
};

// Current user session management
export const setCurrentUser = (user) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const removeCurrentUser = () => {
  localStorage.removeItem('currentUser');
};



// Initialize localStorage with default values if empty for artworks
const initializeArtworksStorage = () => {
  if (!localStorage.getItem('artworks')) {
    localStorage.setItem('artworks', JSON.stringify([]));
  }
};

// Get all artworks
export const getArtworks = () => {
  initializeArtworksStorage();
  return JSON.parse(localStorage.getItem('artworks') || '[]');
};

// Get artwork by ID
export const getArtworkById = (id) => {
  const artworks = getArtworks();
  return artworks.find(artwork => artwork.id === id);
};

// Add a new artwork
export const addArtwork = (artwork) => {
  const artworks = getArtworks();
  artworks.push(artwork);
  localStorage.setItem('artworks', JSON.stringify(artworks));
  return artwork;
};

// Update artwork status to 'approved'
export const approveArtwork = (artworkId) => {
  const artworks = getArtworks();
  const updatedArtworks = artworks.map(artwork => 
    artwork.id === artworkId ? { ...artwork, status: 'approved' } : artwork
  );
  localStorage.setItem('artworks', JSON.stringify(updatedArtworks));
};

// Update an artwork's details
export const updateArtwork = (id, updatedData) => {
  const artworks = getArtworks();
  const index = artworks.findIndex(artwork => artwork.id === id);
  
  if (index !== -1) {
    artworks[index] = { ...artworks[index], ...updatedData };
    localStorage.setItem('artworks', JSON.stringify(artworks));
    return artworks[index];
  }
  
  return null;
};
