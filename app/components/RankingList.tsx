import { useLoaderData } from "@remix-run/react";
import { Reorder } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import styles from "~/styles/RankingList.module.css";

export default function RankingList() {
  const { reviews } = useLoaderData();
  const todaysDate = new Date();
  const aotyRef = useRef<HTMLDivElement>(null);
  const [rankings, updateRankings] = useState(reviews);

  useEffect(() => {
    if (reviews) {
      const tempReviews = [...reviews];

      const thisYearsReviews = tempReviews.filter((review) => {
        const date = new Date(review.reviewDate);

        return date.getFullYear() === todaysDate.getFullYear();
      });

      const thisYearsReviewsSorted = thisYearsReviews.sort(
        (a, b) => b.rating - a.rating
      );

      updateRankings(thisYearsReviewsSorted.slice(0, 10));
    }
  }, []);

  return (
    <>
      {rankings && (
        <Reorder.Group
          axis="y"
          as="ol"
          values={rankings}
          onReorder={updateRankings}
          className={styles.rankingList}
        >
          {rankings.map((review) => (
            <Reorder.Item
              key={review.title}
              value={review}
              className={styles.rankingItem}
            >
              <div className={styles.container}>
                <div className={styles.left}>
                  <img src={review.coverArtSrc} className={styles.cover} />
                  <div className={styles.text}>
                    <h4 className={styles.title}>{review.title}</h4>
                    <p className={styles.artist}>{review.artist}</p>
                  </div>
                </div>
                <div className={styles.right}></div>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
      <div className={styles.aotyImg} ref={aotyRef}>
        <div className={styles.content}>test</div>
      </div>
    </>
  );
}
