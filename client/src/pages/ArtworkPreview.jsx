"use client";

import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "../context/authContext";
import "../styles/artworkPreview.css";

const CountdownTimer = ({
  endTime,
  startTime,
  winner,
  artworkId,
  artistId,
}) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [auctionStatus, setAuctionStatus] = useState("");
  const [extendAuction, setExtendAuction] = useState(false);
  const [newEndTime, setNewEndTime] = useState("");

  const calculateTimeLeft = () => {
    const now = new Date();
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const diffStart = startDate - now;
    const diffEnd = endDate - now;

    if (diffEnd <= 0) {
      if (winner) {
        setAuctionStatus(`Auction ended. Winner: ${winner}`);
      } else {
        setAuctionStatus("Auction ended. No one participated.");
      }
      setTimeLeft("");
    } else if (diffStart > 0) {
      const hours = Math.floor((diffStart / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffStart / 1000 / 60) % 60);
      setAuctionStatus("Auction not started yet");
      setTimeLeft(`${hours}h ${minutes}m remaining`);
    } else {
      const hours = Math.floor((diffEnd / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffEnd / 1000 / 60) % 60);
      setAuctionStatus("Auction ongoing");
      setTimeLeft(`${hours}h ${minutes}m remaining`);
    }
  };

  useEffect(() => {
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [endTime, startTime, winner]);

  const handleExtendAuction = async () => {
    if (!newEndTime) return;
    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `https://localhost:7084/api/Artwork/extend/${artworkId}?newEndTime=${newEndTime}&artistId=${artistId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setExtendAuction(true);
        alert("Auction extended successfully!");
      } else {
        alert("Failed to extend auction.");
      }
    } catch (error) {
      console.error("Error extending auction:", error);
    }
  };

  return (
    <div>
      <span>{timeLeft}</span>
      <div>{auctionStatus}</div>
      {auctionStatus === "Auction ongoing" && !extendAuction && (
        <div className="extend-form">
          <input
            type="datetime-local"
            onChange={(e) => setNewEndTime(e.target.value)}
          />
          <button onClick={handleExtendAuction}>Extend Auction</button>
        </div>
      )}
    </div>
  );
};

export default function ArtworkPreview() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [artworks, setArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArtworks = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        "https://localhost:7084/api/Artwork/user-artworks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setArtworks(data);
      } else {
        console.error("Failed to fetch artworks");
      }
    } catch (error) {
      console.error("Error fetching artworks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (artworkId) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this artwork?"
    );
    if (!confirmDelete) return;

    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `https://localhost:7084/api/Artwork/${artworkId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        alert("Artwork deleted successfully!");
        fetchArtworks();
      } else {
        alert("Failed to delete artwork.");
      }
    } catch (error) {
      console.error("Error deleting artwork:", error);
    }
  };

  const handleEdit = (artworkId) => {
    setLocation(`/edit-artwork/${artworkId}`);
  };

  useEffect(() => {
    if (!user) {
      setLocation("/login");
      return;
    }

    if (user.role !== "Artist") {
      setLocation("/welcome");
      return;
    }

    fetchArtworks();
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h1 className="page-title">My Artworks</h1>
          <Link href="/welcome">
            <a className="btn btn-outline">
              <i className="ri-arrow-left-line"></i> Back to Dashboard
            </a>
          </Link>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <i className="ri-loader-line ri-spin"></i>
            <span>Loading...</span>
          </div>
        ) : artworks && artworks.length === 0 ? (
          <div className="empty-state">
            <i className="ri-gallery-line text-4xl mb-2"></i>
            <h3 className="text-xl font-semibold">No Artworks Yet</h3>
            <p className="text-gray-600">Your artworks will appear here.</p>
          </div>
        ) : (
          <div className="artwork-grid">
            {artworks.map((artwork) => {
              const auctionStartTime = new Date(artwork.auctionStartTime);
              const auctionEndTime = new Date(artwork.auctionEndTime);
              const winner = artwork.winner;

              return (
                <div key={artwork.artworkId} className="artwork-card">
                  {artwork.imageUrl && (
                    <div className="artwork-image">
                      <img
                        src={`https://localhost:7084/${artwork.imageUrl}`}
                        alt={artwork.title}
                      />
                    </div>
                  )}

                  <div className="artwork-details">
                    <h3 className="artwork-title">{artwork.title}</h3>
                    <p className="artwork-description">{artwork.description}</p>

                    <div className="artwork-meta">
                      <div className="meta-item">
                        <span className="meta-label">Category:</span>
                        <span className="meta-value capitalize">
                          {artwork.categoryName}
                        </span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Tags:</span>
                        <div className="tags-list">
                          {artwork.tags &&
                            artwork.tags.length > 0 &&
                            artwork.tags.map((tag, index) => (
                              <span key={index} className="tag">
                                {tag}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div
                        className={`artwork-status ${
                          artwork.status === "approved"
                            ? "status-approved"
                            : artwork.status === "pending"
                            ? "status-pending"
                            : "status-rejected"
                        }`}
                      >
                        {artwork.status === "approved"
                          ? "✅ Approved"
                          : artwork.status === "pending"
                          ? "🕓 Pending"
                          : "❌ Rejected"}
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Auction Start Time:</span>
                        <span className="meta-value">
                          {auctionStartTime.toLocaleString()}
                        </span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Auction End Time:</span>
                        <span className="meta-value">
                          {auctionEndTime.toLocaleString()}
                        </span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">
                          {winner
                            ? "Winner:"
                            : Date.now() < new Date(artwork.auctionStartTime)
                            ? "Auction Starts In:"
                            : "Auction Ends In:"}
                        </span>
                        <span className="meta-value">
                          <CountdownTimer
                            endTime={artwork.auctionEndTime}
                            startTime={artwork.auctionStartTime}
                            winner={winner}
                            artworkId={artwork.artworkId}
                            artistId={artwork.artistId}
                          />
                        </span>
                      </div>

                      <div className="meta-item">
                        <span className="meta-label">Price:</span>
                        <span className="meta-value price">
                          ${artwork.initialPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Buttons for Edit and Delete */}
                    <div className="artwork-actions">
                      <button
                        className="btn btn-edit"
                        onClick={() => handleEdit(artwork.artworkId)}
                      >
                        <i className="ri-edit-line"></i> Edit
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(artwork.artworkId)}
                      >
                        <i className="ri-delete-bin-line"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
