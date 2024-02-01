import React from "react";
import "../css/starrating.css";

const StarRating = ({ rating }) => {
  const totalStars = 5;

  // Ensure the rating is a number and within the expected range
  const validRating =
    typeof rating === "number" ? Math.min(Math.max(0, rating), totalStars) : 0;

  const fullStars = Math.floor(validRating);
  const halfStar = validRating % 1 !== 0 ? 1 : 0;
  const emptyStars = totalStars - fullStars - halfStar;

  // Check to ensure we don't have negative stars
  if (emptyStars < 0) {
    console.error("Invalid star calculation.");
    return null; // Or some other error handling
  }

  return (
    <div className="stars-container">
      {[...Array(fullStars)].map((_, i) => (
        <i
          key={`full-${i}`}
          className="fa-solid fa-star"
          style={{ color: "gold" }}
        />
      ))}
      {halfStar > 0 && (
        <i className="fa-solid fa-star-half-stroke" style={{ color: "gold" }} />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <i
          key={`empty-${i}`}
          className="fa-solid fa-star"
          style={{ color: "grey" }}
        />
      ))}
    </div>
  );
};

export default StarRating;
