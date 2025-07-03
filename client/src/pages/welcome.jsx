"use client";

import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "../context/authContext";
import "../styles/CreateArtwork.css";

export default function Welcome() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLocation("/login");
    }
  }, [user, setLocation]);

  useEffect(() => {
    const fetchCategoriesAndTags = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("accessToken");
        const categoryResponse = await fetch(
          "https://localhost:7084/api/Artwork/categories",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json();
          setCategories(categoryData);
        }

        const tagResponse = await fetch(
          "https://localhost:7084/api/Artwork/tags",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (tagResponse.ok) {
          const tagData = await tagResponse.json();
          setTags(tagData);
        }
      } catch (error) {
        console.error("Error fetching categories and tags:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndTags();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  if (!user) {
    return null;
  }

  const handleSubmitArtwork = async (e) => {
    e.preventDefault();
    const form = e.target.closest("form");
    const formData = new FormData(form);

    const artworkFormData = new FormData();
    artworkFormData.append("title", formData.get("title"));
    artworkFormData.append("description", formData.get("description"));
    artworkFormData.append("initialPrice", formData.get("initialPrice"));
    artworkFormData.append(
      "auctionStartTime",
      formData.get("auctionStartTime")
    );
    artworkFormData.append("auctionEndTime", formData.get("auctionEndTime"));
    artworkFormData.append("categoryId", formData.get("category"));

    selectedTags.forEach((tag) => artworkFormData.append("tags", tag));

    const imageInput = form.querySelector("input[name='image']");
    if (imageInput && imageInput.files.length > 0) {
      artworkFormData.append("image", imageInput.files[0]);
    } else {
      alert("Please select an image.");
      return;
    }

    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch("https://localhost:7084/api/Artwork", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: artworkFormData,
      });

      if (response.ok) {
        alert("Artwork submitted successfully!");
      } else {
        const errorText = await response.text();
        alert(`Error: ${errorText}`);
      }
    } catch (error) {
      alert("There was an error submitting your artwork.");
      console.error(error);
    } finally {
      localStorage.removeItem("tempArtworkImage");
      form.reset();
      setSelectedTags([]);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h1 className="page-title">Welcome Back!</h1>
          <button className="btn btn-outline" onClick={handleLogout}>
            <i className="ri-logout-box-r-line"></i> Logout
          </button>
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            <i className="ri-user-3-line"></i>
          </div>
          <div className="user-info">
            <h2 className="user-name">{user.username}</h2>
            <div className="user-email">
              <i className="ri-at-line"></i>
              <span>{user.username}</span>
            </div>

            <div className="user-badge">
              <span className="capitalize">{user.role}</span>
            </div>
          </div>
        </div>

        {user.role === "Buyer" && (
          <div className="welcome-content">
            <h3 className="content-title">Your Dashboard</h3>
            <p className="content-text">
              Welcome to ArtMarket! As a buyer, you can browse and purchase
              unique artworks directly from talented artists.
            </p>
            <div className="info-box">
              <i className="ri-information-line"></i>
              Start exploring artworks by navigating to the gallery section.
            </div>
            <div className="mt-6 mb-8">
              <Link href="/browse">
                <a className="btn btn-secondary w-full flex items-center justify-center">
                  <i className="ri-eye-line mr-2"></i>Browse Artworks
                </a>
              </Link>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Browse Artworks
              </p>
            </div>
          </div>
        )}

        {user.role === "Artist" && (
          <div className="welcome-content">
            <h3 className="content-title">Artist Dashboard</h3>
            <p className="content-text">
              Welcome to ArtMarket! Your artist account status is:
            </p>

            {user.status === "pending" && (
              <div className="status-box status-pending">
                <i className="ri-time-line"></i>
                <div>
                  <p className="status-title">Account Pending Approval</p>
                  <p className="status-message">
                    An administrator will review your application soon.
                  </p>
                </div>
              </div>
            )}

            {user.status === "approved" && (
              <>
                <div className="status-box status-approved">
                  <i className="ri-check-line"></i>
                  <div>
                    <p className="status-title">Account Approved</p>
                    <p className="status-message">
                      You can now list your artwork in the marketplace.
                    </p>
                  </div>
                </div>

                <div className="mt-6 mb-8">
                  <Link href="/artwork-preview">
                    <a className="btn btn-secondary w-full flex items-center justify-center">
                      <i className="ri-eye-line mr-2"></i> Preview My Artwork
                    </a>
                  </Link>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    View and manage your approved artwork
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Submit New Artwork
                  </h3>
                  <form onSubmit={handleSubmitArtwork} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        required
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter artwork title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        required
                        className="w-full p-2 border rounded-md"
                        rows="4"
                        placeholder="Describe your artwork"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Initial Price ($)
                      </label>
                      <input
                        type="number"
                        name="initialPrice"
                        required
                        min="0.01"
                        step="0.01"
                        className="w-full p-2 border rounded-md"
                        placeholder="Enter minimum price"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Artwork Photo
                      </label>
                      <input
                        type="file"
                        name="image"
                        required
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const imageData = reader.result;
                              localStorage.setItem(
                                "tempArtworkImage",
                                imageData
                              );
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full p-2 border rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Auction Start Time
                      </label>
                      <input
                        type="datetime-local"
                        name="auctionStartTime"
                        required
                        className="w-full p-2 border rounded-md"
                        min={new Date(new Date().setDate(new Date().getDate()))
                          .toISOString()
                          .slice(0, 16)} 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Auction End Time
                      </label>
                      <input
                        type="datetime-local"
                        name="auctionEndTime"
                        required
                        className="w-full p-2 border rounded-md"
                        min={new Date(new Date().setDate(new Date().getDate()))
                          .toISOString()
                          .slice(0, 16)} 
                        onChange={(e) => {
                          const startTime = document.querySelector(
                            'input[name="auctionStartTime"]'
                          );
                          if (
                            startTime &&
                            new Date(e.target.value) <=
                              new Date(startTime.value)
                          ) {
                            alert("End time must be after the start time.");
                            e.target.value = ""; 
                          }
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Category
                      </label>
                      <select
                        name="category"
                        required
                        className="w-full p-2 border rounded-md bg-white"
                      >
                        {categories.map((category) => (
                          <option
                            key={category.categoryId}
                            value={category.categoryId}
                          >
                            {category.categoryName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Tags
                      </label>
                      <div className="tags-container">
                        {tags.map((tag) => (
                          <label key={tag.tagId} className="tag-item">
                            <input
                              type="checkbox"
                              value={tag.tagName}
                              checked={selectedTags.includes(tag.tagName)}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSelectedTags((prev) =>
                                  e.target.checked
                                    ? [...prev, value]
                                    : prev.filter((t) => t !== value)
                                );
                              }}
                            />
                            <span>{tag.tagName}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full">
                      Submit Artwork
                    </button>
                  </form>
                </div>
              </>
            )}

            {user.status === "rejected" && (
              <div className="status-box status-rejected">
                <i className="ri-close-circle-line"></i>
                <div>
                  <p className="status-title">Account Rejected</p>
                  <p className="status-message">
                    Unfortunately, your account application was not approved.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
