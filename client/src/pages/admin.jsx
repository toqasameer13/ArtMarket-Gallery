import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../context/authContext";

export default function Admin() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [pendingArtists, setPendingArtists] = useState([]);
  const [pendingArtworks, setPendingArtworks] = useState([]);
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    pendingArtworks: 0,
  });

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!user) {
      setLocation("/login");
    } else if (user.role !== "Admin") {
      setLocation("/welcome");
    } else {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
  
      if (!token) {
        console.log("No token found, redirecting to login...");
        setLocation("/login");
        return;
      }
  
      const [usersRes, artworksRes] = await Promise.all([  
        fetch("https://localhost:7222/api/Auth/pending-artists", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("https://localhost:7084/api/Artwork/pending-artworks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);
  
      if (!usersRes.ok) {
        console.error(`Error fetching users data: ${usersRes.statusText}`);
        throw new Error("Failed to fetch users data");
      }
  
      if (!artworksRes.ok) {
        console.error(`Error fetching artworks data: ${artworksRes.statusText}`);
        throw new Error("Failed to fetch artworks data");
      }
  
      const usersText = await usersRes.text();
      const artworksText = await artworksRes.text();
  
      let usersData = [];
      let artworksData = [];
  
      if (usersText) {
        usersData = JSON.parse(usersText);
      } else {
        console.error("No users data returned");
      }
  
      if (artworksText) {
        artworksData = JSON.parse(artworksText);
      } else {
        console.error("No artworks data returned");
      }
  
      //console.log("Users Data:", usersData);
      //console.log("Artworks Data:", artworksData);
  
      const approved = usersData.filter((u) => u.status === "approve");
      const pending = usersData.filter((u) => u.status === "pending");
      const artworksPending = artworksData.filter((a) => a.status === "pending");
  
      setPendingArtists(usersData);
      setPendingArtworks(artworksPending);
      setCounts({
        pending :pending.length,
        approved:approved.length,
        pendingArtworks: artworksPending.length,
      });
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };
  
  const handleApproveArtwork = (artworkId) => {
    reviewArtwork(artworkId, "approved");  
};

const handleRejectArtwork = (artworkId) => {
    reviewArtwork(artworkId, "rejected");  
};

const reviewArtwork = async (artworkId, status) => {
  try {
    const token = sessionStorage.getItem("accessToken");

    const response = await fetch(`https://localhost:7084/api/Artwork/approve/${artworkId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(status),  
    });

    if (!response.ok) {
      throw new Error("Failed to review artwork");
    }

    loadData();
  } catch (err) {
    console.error("Error reviewing artwork:", err.message);
  }
};

  

  const reviewArtist = async (userName, status) => {
    try {
      const token = sessionStorage.getItem("accessToken");

      const response = await fetch("https://localhost:7222/api/Auth/review-artist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userName, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to review artist");
      }

      loadData();
    } catch (err) {
      console.error("Error reviewing artist:", err.message);
    }
  };

  const handleApprove = (userName) => {
    reviewArtist(userName, "approved");
  };

  const handleReject = (userName) => {
    reviewArtist(userName, "rejected");
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  if (!user || user.role !== "Admin") {
    return null;
  }

  return (
    <div className="container">
      <div className="admin-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <button className="btn btn-outline" onClick={handleLogout}>
          <i className="ri-logout-box-r-line"></i> Logout
        </button>
      </div>

      <div style={{ marginBottom: "20px", fontSize: "18px" }}>
        Welcome, <strong>{user?.username}</strong>! (Role: {user?.role})
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-content">
            <div className="stat-icon pending-icon">
              <i className="ri-user-add-line"></i>
            </div>
            <div className="stat-data">
              <div className="stat-label">Pending Artists</div>
              <div className="stat-value">{counts.pending}</div>
            </div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-content">
            <div className="stat-icon approved-icon">
              <i className="ri-user-follow-line"></i>
            </div>
            <div className="stat-data">
              <div className="stat-label">Approved Artists</div>
              <div className="stat-value">{counts.approved}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Artworks Table */}
      <div className="card mt-6">
        <div className="table-header">
          <h2 className="section-title">Pending Artwork Approvals</h2>
          <div className="table-meta">Showing {counts.pendingArtworks} pending artworks</div>
        </div>
        {pendingArtworks.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Description</th>
                  <th>Initial Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingArtworks.map((artwork) => (
                  <tr key={artwork.title}>
                    <td className="image-cell">
                      {artwork.imageUrl ? (
                        <img
                        src={`https://localhost:7084/${artwork.imageUrl}`}
                          alt={artwork.title}
                          className="artwork-thumbnail"
                          style={{ width: "100px", height: "100px", objectFit: "cover" }}
                        />
                      ) : (
                        <div className="no-image-placeholder">No Image</div>
                      )}
                    </td>
                    <td>{artwork.title}</td>
                    <td>{artwork.artistName}</td>
                    <td>
                      <div className="truncate-text">{artwork.description}</div>
                    </td>
                    <td>${artwork.initialPrice}</td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleApproveArtwork(artwork.artworkId)}>
                        <i className="ri-check-line"></i> Approve
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRejectArtwork(artwork.artworkId)}>
                        <i className="ri-close-line"></i> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="ri-file-list-3-line"></i>
            </div>
            <h3 className="empty-title">No Pending Artworks</h3>
            <p className="empty-message">All artworks have been reviewed</p>
          </div>
        )}
      </div>

      {/* Pending Artists Table */}
      <div className="card">
        <div className="table-header">
          <h2 className="section-title">Pending Artist Approvals</h2>
          <div className="table-meta">Showing {counts.pending} pending requests</div>
        </div>
        {pendingArtists.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Bio</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingArtists.map((artist) => (
                  <tr key={artist.username}>
                    <td>{artist.fullName}</td>
                    <td>@{artist.username}</td>
                    <td>{artist.email}</td>
                    <td>
                      <div className="truncate-text">{artist.bio}</div>
                    </td>
                    <td>
                      <span className="status-badge status-pending">Pending</span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleApprove(artist.username)}>
                        <i className="ri-check-line"></i> Approve
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleReject(artist.username)}>
                        <i className="ri-close-line"></i> Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="ri-user-line"></i>
            </div>
            <h3 className="empty-title">No Pending Artists</h3>
            <p className="empty-message">All artist applications are approved</p>
          </div>
        )}
      </div>
    </div>
  );
}
