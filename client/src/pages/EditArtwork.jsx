"use client";

import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "../context/authContext";
import "../styles/editArtwork.css";

export default function EditArtwork() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { artworkId } = useParams();

  const [categories, setCategories] = useState([]);
  const [tagsList, setTagsList] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryName: "",
    categoryId: "", 
    tags: [],
    initialPrice: 0,
    auctionStartTime: "",
    auctionEndTime: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");

        // Fetch artwork
        const artworkRes = await fetch(
          `https://localhost:7084/api/Artwork/${artworkId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (artworkRes.ok) {
          const data = await artworkRes.json();
          console.log("Fetched artwork data:", data);
          setFormData({
            title: data.title,
            description: data.description,
            categoryName: data.categoryName,
            categoryId: data.categoryId, // تعيين categoryId
            tags: data.tags,
            initialPrice: data.initialPrice,
            auctionStartTime: data.auctionStartTime.slice(0, 16),
            auctionEndTime: data.auctionEndTime.slice(0, 16),
          });
        } else {
          alert("Failed to load artwork.");
        }

        // Fetch categories
        const categoryRes = await fetch(
          "https://localhost:7084/api/Artwork/categories",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (categoryRes.ok) {
          const catData = await categoryRes.json();
          console.log("Fetched categories data:", catData);
          setCategories(catData);
        }

        // Fetch tags
        const tagRes = await fetch("https://localhost:7084/api/Artwork/tags", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (tagRes.ok) {
          const tagData = await tagRes.json();
          console.log("Fetched tags data:", tagData);
          setTagsList(tagData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      setLocation("/login");
    }
  }, [artworkId, user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox" && name === "tags") {
      setFormData((prev) => ({
        ...prev,
        tags: checked
          ? [...prev.tags, value]
          : prev.tags.filter((tag) => tag !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `https://localhost:7084/api/Artwork/${artworkId}`,
        {
          method: "Patch",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        alert("Artwork updated successfully!");
        setLocation("/artworks");
      } else {
        alert("Failed to update artwork.");
      }
    } catch (error) {
      console.error("Error updating artwork:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <i className="ri-loader-line ri-spin"></i> Loading...
      </div>
    );
  }

  return (
    <div className="edit-container">
      <h1>Edit Artwork</h1>
      <form onSubmit={handleSubmit} className="edit-form">
        <label>
          Title:
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Category:
          <select
            name="categoryId"
            value={formData.categoryId || ""} 
            onChange={(e) => {
              const selectedCategoryId = e.target.value;
              const selectedCategory = categories.find(
                (cat) => cat.categoryId === selectedCategoryId
              );
              setFormData((prev) => ({
                ...prev,
                categoryId: selectedCategory.categoryId, 
                categoryName: selectedCategory.categoryName, 
              }));
            }}
            required
          >
            <option value="">{"Select a category"}</option> {}
            {categories.length > 0 ? (
              categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
                </option>
              ))
            ) : (
              <option disabled>No categories available</option>
            )}
          </select>
        </label>

        <label>
          Tags:
          <div className="tags-checkboxes">
            {tagsList.length > 0 ? (
              tagsList.map((tag) => (
                <label key={tag.tagId}>
                  <input
                    type="checkbox"
                    name="tags"
                    value={tag.tagName}
                    checked={formData.tags.includes(tag.tagName)} 
                    onChange={handleChange}
                  />
                  {tag.tagName}
                </label>
              ))
            ) : (
              <span>No tags available</span>
            )}
          </div>
        </label>

        <label>
          Initial Price ($):
          <input
            type="number"
            name="initialPrice"
            value={formData.initialPrice}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Auction Start Time:
          <input
            type="datetime-local"
            name="auctionStartTime"
            value={formData.auctionStartTime}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Auction End Time:
          <input
            type="datetime-local"
            name="auctionEndTime"
            value={formData.auctionEndTime}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" className="btn-save">
          <i className="ri-save-line"></i> Save Changes
        </button>
      </form>
    </div>
  );
}
