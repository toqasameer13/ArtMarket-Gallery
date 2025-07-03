import "../styles/BrowseArtworks.css";
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../context/authContext";

const BrowseArtworks = () => {
  const { user, logout } = useAuth();
  const [filters, setFilters] = useState({
    artist: "",
    category: "",
    tag: "",
    maxPrice: "",
  });
  const [artworks, setArtworks] = useState([]);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (user && user.role !== "Buyer") {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const response = await fetch("https://localhost:7084/api/Artwork", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setArtworks(data);
        } else {
          console.error("Failed to fetch artworks");
        }
      } catch (error) {
        console.error("Error fetching artworks:", error);
      }
    };

    fetchArtworks();
  }, []);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredArtworks = artworks.filter((art) => {
    const matchesArtist = filters.artist
      ? art.artistName.toLowerCase().includes(filters.artist.toLowerCase())
      : true;
    const matchesCategory = filters.category
      ? art.category?.toLowerCase().includes(filters.category.toLowerCase())
      : true;
    const matchesTag = filters.tag
      ? art.tags?.some((tag) =>
          tag.toLowerCase().includes(filters.tag.toLowerCase())
        )
      : true;
    const matchesPrice = filters.maxPrice
      ? art.initialPrice <= parseFloat(filters.maxPrice)
      : true;

    return matchesArtist && matchesCategory && matchesTag && matchesPrice;
  });

  return (
    <div className="page-container">
      <div className="artworks-card">
        {user && (
          <div className="user-bar">
            <div className="user-bar-info">
              <div className="user-bar-item">
                <i className="ri-user-line"></i> Welcome, {user.name || user.username}
              </div>
              <div className="user-bar-item">
                <i className="ri-at-line"></i> {user.username}
              </div>
              <div className="user-bar-item">
                <i className="ri-mail-line"></i> {user.email || "No email"}
              </div>
            </div>
            <button className="user-bar-logout" onClick={handleLogout}>
              <i className="ri-logout-box-line"></i> Logout
            </button>
          </div>
        )}

        <h2 className="artworks-title">Browse Artworks</h2>

        <div className="filters-grid">
          <input
            name="artist"
            placeholder="Artist"
            value={filters.artist}
            onChange={handleChange}
            className="filter-input"
          />
          <input
            name="category"
            placeholder="Category"
            value={filters.category}
            onChange={handleChange}
            className="filter-input"
          />
          <input
            name="tag"
            placeholder="Tag"
            value={filters.tag}
            onChange={handleChange}
            className="filter-input"
          />
          <input
            name="maxPrice"
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={handleChange}
            className="filter-input"
          />
        </div>

        <div className="artworks-grid">
          {filteredArtworks.length === 0 ? (
            <p>No approved artworks match your search.</p>
          ) : (
            filteredArtworks.map((art) => (
              <Link to={`/artworks/${art.artworkId}`} key={art.artworkId}>
                <div className="art-card">
                  <img
                    src={`https://localhost:7084/${art.imageUrl}`}
                    alt={art.title}
                    className="art-image"
                  />
                  <div className="art-content">
                    <h3 className="art-title">{art.title}</h3>
                    <p className="artist-name">
                      By <span>{art.artistName}</span>
                    </p>
                    <p className="art-info">
                      Category: {art.categoryName}
                    </p>
                    <p className="art-info">
                      Tags: {art.tags?.join(", ") || "No tags"}
                    </p>
                    <p className="art-price">${art.initialPrice}</p>
                  </div>
                </div>
              </Link> 
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowseArtworks;
