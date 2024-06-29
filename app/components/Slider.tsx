import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/Slider.module.css";
import { motion } from "framer-motion";

const Slider = ({ sliderChange, value }) => {
  const ratings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const [currentRating, setCurrentRating] = useState(value);
  const listRef = useRef(null);

  const variants = {
    selected: { color: "green", y: 0 },
    unselected: { color: "white", y: 5 },
  };

  const handleScroll = () => {
    if (listRef.current) {
      const scrollLeft = listRef.current.scrollLeft;
      const itemWidth = 20; // 20 is the width of each item (modify if different)
      const centerPosition = scrollLeft + listRef.current.clientWidth / 2;
      const ratingIndex = Math.round((centerPosition - 60) / itemWidth - 0.5); // Adjust centerPosition by 50px (padding)
      const newRating = ratings[ratingIndex];
      setCurrentRating(newRating);
      sliderChange(newRating);
      triggerHapticFeedback();
    }
  };

  const triggerHapticFeedback = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50); // Vibrate for 50 milliseconds
    }
  };

  useEffect(() => {
    const list = listRef.current;
    if (list) {
      const itemWidth = 20; // Width of each rating item
      const initialScrollLeft = value * itemWidth; // Calculate initial scroll position

      list.scrollTo({
        left: initialScrollLeft,
        behavior: "smooth", // Optional: Smooth scrolling animation
      });
    }
  }, []);

  useEffect(() => {
    const list = listRef.current;
    list.addEventListener("scroll", handleScroll);
    return () => list.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles.sliderContainer}>
      <ul className={styles.ratingList} ref={listRef}>
        {ratings.map((rating, index) => (
          <motion.div
            key={index}
            className={styles.rating}
            animate={rating === currentRating ? "selected" : "unselected"}
            variants={variants}
            transition={{ duration: 0.3 }}
          >
            {rating}
          </motion.div>
        ))}
      </ul>
    </div>
  );
};

export default Slider;
