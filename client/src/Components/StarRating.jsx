import React from "react";
import "../css/starrating.css";

const StarRating = ({ rating }) => {
  const totalStars = 5;

  const fullStars = Math.floor(rating);
  const halfStars = rating % 1 !== 0 ? 1 : 0;
  const emptyStars = totalStars - fullStars - halfStars;

  return (
    <div className="stars-container">
      {[...Array(fullStars)].map((_, i) => (
        <i
          key={`full-${i}`}
          className="fa-solid fa-star"
          style={{ color: "gold" }}
        />
      ))}
      {halfStars > 0 && (
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
