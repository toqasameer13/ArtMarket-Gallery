import "../styles/ArtworkDetails.css";
import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useAuth } from "../context/authContext";
import * as signalR from "@microsoft/signalr";
import Confetti from "react-confetti";
import { useWindowSize } from "@react-hook/window-size";

const ArtworkDetails = () => {
  const { user, logout } = useAuth();
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [width, height] = useWindowSize();
  const [artwork, setArtwork] = useState(null);
  const [bids, setBids] = useState([]);
  const [newBid, setNewBid] = useState("");
  const [minBid, setMinBid] = useState(0);
  const [winner, setWinner] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [auctionStatus, setAuctionStatus] = useState("");

  // Fetch artwork data from API
  const fetchArtwork = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(`https://localhost:7084/api/Artwork/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setArtwork(data);
        setMinBid(data.currentPrice);
      } else {
        navigate("/browse");
      }
    } catch (error) {
      navigate("/browse");
    }
  };

  // Determine current highest bidder
  useEffect(() => {
    if (bids.length > 0) {
      const highest = bids.reduce((max, bid) =>
        bid.amount > max.amount ? bid : max
      );
      setWinner(highest);
    }
  }, [bids]);

  // Auction countdown & automatic ending
  useEffect(() => {
    const interval = setInterval(() => {
      if (!artwork) return;

      const now = new Date();
      const start = new Date(artwork.auctionStartTime);
      const end = new Date(artwork.auctionEndTime);

      if (now < start) {
        setAuctionStatus("not_started");
        setTimeLeft(formatTime(start - now));
      } else if (now >= start && now <= end) {
        setAuctionStatus("running");
        setTimeLeft(formatTime(end - now));
      } else if (auctionStatus !== "ended") {
        setAuctionStatus("ended");
        setTimeLeft("Auction Ended");

        // End auction on backend
        const endAuction = async () => {
          try {
            const token = sessionStorage.getItem("accessToken");
            const response = await fetch(
              `https://localhost:7028/api/Bids/end-auction/${id}`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              setWinner(data);
            }
          } catch (error) {
            console.error("Error ending auction:", error);
          }
        };

        endAuction();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [artwork, id, auctionStatus]);

  // SignalR: Real-time bid updates
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7028/auctionHub", {
        accessTokenFactory: () => sessionStorage.getItem("accessToken"),
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => connection.invoke("JoinArtworkGroup", id))
      .catch((err) => console.error("SignalR Error:", err));

    connection.on("ReceiveBid", (bid) => {
      setBids((prev) => [...prev, bid]);
      setMinBid(bid.amount + 10);
    });

    return () => connection.stop();
  }, [id]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Submit new bid
  const handleBid = async (e) => {
    e.preventDefault();
    const bidValue = parseFloat(newBid);
    if (isNaN(bidValue) || bidValue < minBid) {
      alert(`Minimum bid must be at least $${minBid}`);
      return;
    }

    try {
      const response = await fetch("https://localhost:7028/api/Bids/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ artworkId: id, amount: bidValue }),
      });

      if (response.ok) {
        setNewBid("");
        fetchArtwork(); // Update artwork details after bid
      } else {
        alert("Failed to place bid");
      }
    } catch (error) {
      console.error("Error placing bid:", error);
    }
  };

  const handlePayment = (bidder, amount,title) => {
    console.log(bidder);
    console.log(amount);
    navigate(`/payment/${id}?amount=${amount}&bidder=${bidder}&title=${title}`);
  };

  useEffect(() => {
    fetchArtwork();
  }, [id]);

  if (!artwork) {
    return <p className="loading">Loading artwork...</p>;
  }

  return (
    <div className="page-container">
      <div className="artworks-card">
        {user && (
          <div className="user-bar">
            <div className="user-bar-info">
              <div className="user-bar-item">
                <i className="ri-user-line"></i> Welcome,{" "}
                {user.name || user.username}
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

        <div className="artwork-details-card">
          <div className="artwork-details-content">
            <img
              src={`https://localhost:7084/${artwork.imageUrl}`}
              alt={artwork.title}
              className="artwork-img"
              onError={(e) => (e.target.src = "/placeholder.png")}
            />

            <div className="details-card">
              <Link to="/browse">
                <button className="back-button">Back to Artworks</button>
              </Link>

              <h2 className="art-title letter-glow">
                {artwork.title.split("").map((char, index) => (
                  <span
                    key={index}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {char}
                  </span>
                ))}
              </h2>

              <div className="art-meta-item artist-info-alt">
                <span className="label">🎨 Artist:</span>
                <span className="artist-name-glow">{artwork.artistName}</span>
              </div>

              <p className="art-info">
                🕒 Start Time:{" "}
                {new Date(artwork.auctionStartTime).toLocaleString()}
              </p>
              <p className="art-info">
                ⏰ End Time: {new Date(artwork.auctionEndTime).toLocaleString()}
              </p>
              <br />
              {auctionStatus === "not_started" && (
                <p style={{ color: "orange" }}>
                  Auction starts in: ⏳ {timeLeft}
                </p>
              )}
              {auctionStatus === "running" && (
                <p style={{ color: "green" }}>Auction ends in: ⌛ {timeLeft}</p>
              )}
              {auctionStatus === "ended" && (
                <p style={{ color: "red" }}>⛔ Auction has ended</p>
              )}
              <br />
              <div className="art-meta-item">
                <span className="label">📁 Category:</span>{" "}
                <span className="value">{artwork.categoryName}</span>
              </div>
              <br />
              <div className="art-meta-item">
                <span className="label">🏷️ Tags:</span>{" "}
                <span className="value">{artwork.tags.join(", ")}</span>
              </div>
              <br />
              <div className="art-meta-item">
                <span className="label">📝 Description:</span>
                <p className="description-text">{artwork.description}</p>
              </div>
              <br />
              <div className="art-meta-item price-bounce">
                <span className="label">💰 Starting Price:</span>
                <span className="value bounce">${artwork.initialPrice}</span>
              </div>
              <br />
              <div className="art-meta-item price-bounce">
                <span className="label">💰 Current Bid:</span>{" "}
                <span className="value bounce">
                  ${winner ? winner.amount : minBid}
                </span>
              </div>
              <br />
              {/* Place Bid Form */}
              {auctionStatus === "running" && user && (
                <div className="bid-section">
                  <h3>Place a Bid:</h3>
                  <form onSubmit={handleBid}>
                    <input
                      type="number"
                      placeholder="Enter your bid"
                      value={newBid}
                      onChange={(e) => setNewBid(e.target.value)}
                    />
                    <button type="submit">Place Bid</button>
                  </form>
                </div>
              )}
              <br />
              {/* Auction Ended Info */}
              {auctionStatus === "ended" && (
                <>
                  {winner && (
                    <div className="winner-section">
                      {artwork.winner === user?.username ? (
                        <>
                          <Confetti
                            width={width}
                            height={height}
                            numberOfPieces={400}
                          />
                          <p className="winner-message highlight">
                            You are the highest bidder!
                          </p>
                          <button
                            className="pay-button"
                            onClick={() =>
                              handlePayment(
                                artwork.winner,
                                artwork.currentPrice,
                                artwork.title
                              )
                            }
                          >
                            🎁 Proceed to Payment
                          </button>
                        </>
                      ) : (
                        <p className="winner-message">
                          🏆 <strong>{artwork.winner}</strong> won this auction
                          with ${artwork.currentPrice}
                        </p>
                      )}
                    </div>
                  )}

                  <br />

                  {user && (
                    <Link to={`/artwork/${id}/history`}>
                      <button className="history-button">
                        📜 View Full Bid History
                      </button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetails;
