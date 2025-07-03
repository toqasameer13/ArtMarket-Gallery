import React, { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import "../styles/BidHistoryPage.css";

const BidHistoryPage = () => {
  const { id } = useParams();
  const [bids, setBids] = useState([]);
  const [artworkTitle, setArtworkTitle] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem("accessToken");

      try {
        const bidsResponse = await fetch(
          `https://localhost:7028/api/Bids/history/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (bidsResponse.ok) {
          const bidsData = await bidsResponse.json();
          setBids(bidsData);
        }

        const artworkResponse = await fetch(
          `https://localhost:7084/api/Artwork/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (artworkResponse.ok) {
          const artworkData = await artworkResponse.json();
          setArtworkTitle(artworkData.title);
        }
      } catch (error) {
        console.error("Error fetching bid history or artwork:", error);
      }
    };

    fetchData();
  }, [id]);

  return (
    <div className="bid-history-page">
      <h2>
        Bid History for:{" "}
        <span className="highlight">{artworkTitle || `Artwork #${id}`}</span>
      </h2>

      <Link to={`/artworks/${id}`}>
        <button className="back-button">⬅️ Back to Artwork</button>
      </Link>

      {bids.length === 0 ? (
        <p className="no-bids">No bids yet.</p>
      ) : (
        <ul>
          {bids.map((bid) => (
            <li key={bid.id} className="bid-item">
              <div className="bidder-name">{bid.bidderName}</div>
              <div className="bid-info">
                <span className="bid-amount">${bid.amount.toFixed(2)}</span>
                <span className="bid-time">
                  {new Date(bid.timestamp).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BidHistoryPage;
