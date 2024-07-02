import { useEffect, useState } from "react";

import styles from "../styles/RecentReviews.module.css";
import { months } from "~/helpers/dates";

export default function RecentReviews({ reviews }) {
  const [reviewList, updateReviewList] = useState(reviews);
  const [sortOption, setSortOption] = useState("recency");

  useEffect(() => {
    const sortedReviews = [...reviews];

    const sortData = (reviews, option) => {
      switch (option) {
        case "recency":
          return reviews.sort(
            (a, b) => new Date(b.reviewDate) - new Date(a.reviewDate)
          );
        case "rating":
          return reviews.sort((a, b) => b.rating - a.rating);
        default:
          return reviews;
      }
    };

    const sorted = sortData(sortedReviews, sortOption);
    updateReviewList(sorted);
  }, [reviews, sortOption]);

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  return (
    <div className={styles.recentReviewsContainer}>
      <h1 className={styles.recentlyReviewedHeader}>Recently Reviewed:</h1>
      <div className={styles.buttonsAndContent}>
        <div className={styles.filters}>
          <label htmlFor="sortOptions">Sort by: </label>
          <select
            value={sortOption}
            onChange={handleSortChange}
            className={styles.sortDropdown}
          >
            <option value="recency">Recency</option>
            <option value="rating">Rating</option>
          </select>
        </div>
        <div className={styles.list}>
          {reviewList.map((review) => {
            const date = new Date(review.reviewDate);
            return (
              <div className={styles.recentReview} key={review.id}>
                <div className={styles.left}>
                  <img
                    className={styles.resultImg}
                    src={review.coverArtSrc}
                    alt={review.id}
                  />
                  <div className={styles.reviewInfo}>
                    <h4 className={styles.albumTitle}>{review.title}</h4>
                    <h5 className={styles.artist}>{review.artist}</h5>
                    <p className={styles.reviewDate}>{`Reviewed on: ${
                      months[date.getMonth()]
                    } ${date.getDate()}, ${date.getFullYear()}`}</p>
                  </div>
                </div>
                <div className={styles.right}>
                  <h2>{`${review.rating}/10`}</h2>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
