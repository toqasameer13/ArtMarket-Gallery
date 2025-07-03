import React, { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import "../styles/PaymentPage.css";

const PaymentPage = () => {
  const { id } = useParams();
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [amount, setAmount] = useState(null);
  const [bidder, setBidder] = useState(null);
  const [title, setTitle] = useState(null);
  console.log("Amount:", amount);  
  console.log("Bidder:", bidder);   
  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setAmount(searchParams.get("amount"));
    setBidder(searchParams.get("bidder"));
    setTitle(searchParams.get("title"));
}, []);

  const handlePayment = async () => {
    try {
      const response = await fetch(
        `https://localhost:7028/api/Payments/${id}`,
        {
          method: "POST",
          body: JSON.stringify({ method: paymentMethod }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setPaymentStatus("✅ Payment Successful!");
      } else {
        setPaymentStatus("❌ Payment Failed. Please try again.");
      }
    } catch (error) {
      setPaymentStatus("❌ Payment Failed. Please try again.");
    }
  };

  return (
    <div className="payment-page">
      <h2>
        Payment for: <span className="highlight">{title}</span>
      </h2>

      {bidder && amount ? (
        <>
          <p>👤 Bidder: <strong>{bidder}</strong></p>
          <p>💰 Amount: <strong>${amount}</strong></p>
        </>
      ) : (
        <p className="error">⚠️ Missing payment information in the URL.</p>
      )}

      <div className="payment-methods">
        <h3>Select Payment Method</h3>
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="Credit Card"
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Credit Card
        </label>
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="PayPal"
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          PayPal
        </label>
        <label>
          <input
            type="radio"
            name="paymentMethod"
            value="Stripe"
            onChange={(e) => setPaymentMethod(e.target.value)}
          />
          Stripe
        </label>
      </div>

      {paymentMethod && (
        <div className="payment-info">
          <p>You have selected: <strong>{paymentMethod}</strong></p>
          <button onClick={handlePayment} className="pay-button">
            Proceed with Payment
          </button>
        </div>
      )}

      {paymentStatus && (
        <div
          className={`payment-status ${
            paymentStatus.includes("Failed") ? "failed" : "success"
          }`}
        >
          <p>{paymentStatus}</p>
        </div>
      )}

      <Link to={`/artworks/${id}`}>
        <button className="back-button">⬅️ Back to Artwork</button>
      </Link>
    </div>
  );
};

export default PaymentPage;
