import React, { useEffect, useRef, useState } from "react";
import { domToPng } from "modern-screenshot";
import domtoimage from "dom-to-image";
import { useLoaderData, useLocation } from "@remix-run/react";
import styles from "../styles/Canvas.module.css";
import { AnimatePresence, motion } from "framer-motion";

const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [isSnap, toggleSnap] = useState(true);
  const [tracklistRatings, updateTracks] = useState([{}]);
  const [albumDetails, setAlbumDetails] = useState<any | null>(
    location.state && location.state.albumDetails
  );
  const [overallScore, updateOverallScore] = useState(0);
  const [coverScore, updateCoverScore] = useState(0);
  const [showModal, toggleModal] = useState(false);
  let run = false;

  const [isDownloading, setIsDownloading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const songTiers = [
    { tierName: "Average", tierColor: "#FFFFFF" },
    { tierName: "Good", tierColor: "#6FE17E" },
    { tierName: "Favorite", tierColor: "#EDF12F" },
    { tierName: "Skit/Interlude", tierColor: "#12B1B8" },
    { tierName: "Bad", tierColor: "#F7200E" },
  ];

  const calculateFontSize = (
    containerHeight: number,
    numberOfTracks: number
  ) => {
    const maxFontSize = 40; // Maximum font size
    const minFontSize = 10; // Minimum font size

    // Calculate the available height per item
    const availableHeightPerItem = containerHeight / numberOfTracks;

    console.log(containerHeight);

    // Ensure the calculated font size is within the defined min and max limits
    const fontSize = Math.max(
      minFontSize,
      Math.min(maxFontSize, availableHeightPerItem)
    );

    console.log(fontSize);

    return `${fontSize}px`;
  };

  useEffect(() => {
    // Retrieve saved album details and ratings from localStorage
    const savedAlbumDetails = localStorage.getItem("albumDetails");
    const savedTracklistRatings = localStorage.getItem("tracklistRatings");
    const savedOverallScore = localStorage.getItem("overallScore");

    if (!run) {
      if (
        savedAlbumDetails &&
        savedTracklistRatings &&
        savedOverallScore &&
        JSON.parse(savedAlbumDetails).title === albumDetails.title
      ) {
        setAlbumDetails(JSON.parse(savedAlbumDetails));
        updateTracks(JSON.parse(savedTracklistRatings));
        updateOverallScore(parseInt(savedOverallScore));
      } else {
        const tracklistRatingsTemp = [];
        albumDetails.trackList.forEach((trackName: any) => {
          tracklistRatingsTemp.push({
            name: trackName,
            rating: 0,
            tier: songTiers[0],
          });
        });
        updateTracks(tracklistRatingsTemp);
      }
    }

    run = true;
  }, []);

  useEffect(() => {
    // Save album details, ratings, and overall score to localStorage whenever they change
    localStorage.setItem("albumDetails", JSON.stringify(albumDetails));

    if (tracklistRatings.length > 1) {
      localStorage.setItem(
        "tracklistRatings",
        JSON.stringify(tracklistRatings)
      );
    }

    if (overallScore !== 0) {
      localStorage.setItem("overallScore", overallScore.toString());
    }
  }, [albumDetails, tracklistRatings, overallScore]);

  const handleImageGen = async () => {
    const containerElement = containerRef.current;
    const modal = modalRef.current;

    if (containerElement) {
      setIsDownloading(true);

      if (!showModal) {
        toggleModal(true);
      }

      try {
        const dataUrl = await domtoimage.toPng(containerElement);

        // Remove any existing images inside the modal
        while (modal?.firstChild) {
          modal?.removeChild(modal?.firstChild);
        }

        // Create and append the new image
        const img = new Image();
        img.onload = function () {
          modal?.appendChild(img);
        };
        img.onerror = function (error) {
          console.error("Failed to load image", error);
        };
        img.src = dataUrl;
      } catch (error) {
        console.error("oops, something went wrong!", error);
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handleBackgroundImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files && e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setBackgroundImage(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleTrackClick = (track, index) => {
    const trackRatings = [...tracklistRatings];
    const trackEntryIndex = index;
    let tierIndex = -1;

    songTiers.forEach((tier, index2) => {
      if (tier.tierName === trackRatings[index].tier.tierName) {
        tierIndex = index2;
      }
    });

    if (trackRatings[trackEntryIndex] && tierIndex > -1) {
      if (tierIndex === songTiers.length - 1) {
        trackRatings[trackEntryIndex].tier = songTiers[0];
      } else {
        trackRatings[trackEntryIndex].tier = songTiers[tierIndex + 1];
      }
    }

    updateTracks(trackRatings);
  };

  const handleRatingChange = (e, index, isTrack, type) => {
    const trackRatings = [...tracklistRatings];

    if (isTrack) {
      let totalScore = 0;

      trackRatings[index].rating = e.currentTarget.innerText;
      updateTracks(trackRatings);

      tracklistRatings.forEach((track) => {
        totalScore = parseInt(totalScore) + parseInt(track.rating);
      });

      const averageScore = Math.round(totalScore / trackRatings.length);
      updateOverallScore(averageScore);
    } else {
      if (type === "overall") {
        updateOverallScore(e.currentTarget.innerText);
      } else {
        updateCoverScore(e.currentTarget.innerText);
      }
    }
  };

  const handleTrackRatingClick = (e: React.MouseEvent<HTMLSpanElement>) => {
    const trackElement = e.target as HTMLSpanElement;

    trackElement.focus();
    const selection = window.getSelection();
    if (selection) {
      const range = document.createRange();
      range.selectNodeContents(trackElement);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showModal && (
          <motion.div
            className={styles.modalOverlay}
            onClick={(e) => {
              if (
                !e.target.classList.contains(styles.modal) &&
                !e.target.classList.contains(styles.button)
              ) {
                toggleModal(false);
              }
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.resultImg} ref={modalRef}></div>
              <motion.button
                className={styles.button}
                disabled={!albumDetails}
                whileHover={{
                  scale: 1.2,
                  transition: { duration: 1 },
                }}
                whileTap={{ scale: 0.9 }}
                style={{ justifySelf: "center" }}
                onClick={handleImageGen}
              >
                Generate
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.ratingControls}>
        <div className={styles.trackRatings}>
          <ul>
            {tracklistRatings &&
              tracklistRatings.map((track, index) => {
                let textColor;
                if (
                  tracklistRatings &&
                  track &&
                  track.tier &&
                  track.tier.tierColor
                ) {
                  textColor = track.tier.tierColor;
                } else {
                  textColor = "#FFFFFF";
                }
                return (
                  <li className={styles.trackRatingControl}>
                    <span
                      style={{ color: textColor }}
                      onClick={() => handleTrackClick(track, index)}
                    >
                      {track.name}
                    </span>
                    {" ("}
                    <span
                      contentEditable
                      suppressContentEditableWarning={true}
                      onInput={(e) => handleRatingChange(e, index, true)}
                      onFocus={(e) =>
                        document.execCommand("selectAll", false, null)
                      }
                      onClick={handleTrackRatingClick}
                    >
                      {`${track.rating ? track.rating : "0"}`}
                    </span>
                    {"/10)"}
                  </li>
                );
              })}
          </ul>
          <h2>
            <span
              contentEditable
              suppressContentEditableWarning={true}
              onInput={(e) => {
                handleRatingChange(e, 0, false, "overall");
              }}
              onClick={handleTrackRatingClick}
            >{`${overallScore}`}</span>
            {`/10`}
          </h2>
          <h2>
            {"Cover: "}
            <span
              contentEditable
              suppressContentEditableWarning={true}
              onInput={(e) => {
                handleRatingChange(e, 0, false, "cover");
              }}
              onClick={handleTrackRatingClick}
            >{`${coverScore}`}</span>
            {`/10`}
          </h2>
        </div>
        <div className={styles.buttons}>
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundImageChange}
          />
          <button
            className={styles.button}
            onClick={() => toggleModal(true)}
            disabled={isDownloading}
          >
            {isDownloading ? "Downloading..." : "Generate Image"}
          </button>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={isSnap}
              onChange={(e) => toggleSnap(e.target.checked)}
            />
            <span className={`${styles.slider} ${styles.round}`}></span>
          </label>
        </div>
      </div>
      <div className={styles.canvasContainer}>
        <div
          ref={containerRef}
          id="canvas"
          className={styles.canvas}
          style={{ height: "1920px", width: "1080px" }}
        >
          <div
            className={styles.backgroundImage}
            style={{
              background: `url(${backgroundImage}) center center/cover`,
              filter: "blur(5px) brightness(70%)",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          ></div>
          <div className={styles.content}>
            <h2
              className={styles.title}
              style={{ marginTop: `${isSnap ? "300px" : "50px"}` }}
            >{`${albumDetails ? albumDetails.artist : ""} - ${
              albumDetails ? albumDetails.title : ""
            }`}</h2>
            <div className={styles.albumDetails}>
              <div className={styles.left} ref={leftRef}>
                <ul>
                  {tracklistRatings &&
                    tracklistRatings.map((track: any) => {
                      let textColor;
                      if (
                        tracklistRatings &&
                        track &&
                        track.tier &&
                        track.tier.tierColor
                      ) {
                        textColor = track.tier.tierColor;
                      } else {
                        textColor = "#FFFFFF";
                      }
                      const fontSize = calculateFontSize(
                        700, // Use container width or fallback to canvas width
                        tracklistRatings.length
                      );

                      return (
                        <li key={track.name} style={{ fontSize: fontSize }}>
                          <span style={{ color: textColor }}>{track.name}</span>{" "}
                          <span
                            contentEditable
                            suppressContentEditableWarning={true}
                          >{`(${track.rating}/10)`}</span>
                        </li>
                      );
                    })}
                </ul>
              </div>
              <div className={styles.right}>
                <div className={styles.top}>
                  <span
                    contentEditable
                    suppressContentEditableWarning={true}
                    className={styles.rating}
                  >
                    {`${overallScore}/10`}
                  </span>
                </div>
                <div className={styles.bottom}>
                  <div className={styles.coverAndRating}>
                    <div className={styles.coverRating}>
                      {"Cover: "}
                      <span
                        contentEditable
                        suppressContentEditableWarning={true}
                        onClick={handleTrackRatingClick}
                      >
                        {coverScore}
                      </span>
                      /10
                    </div>
                    <img
                      className={styles.cover}
                      src={albumDetails ? albumDetails.coverSrc : ""}
                      alt=""
                    />
                  </div>
                  <div className={styles.legend}>
                    {songTiers.map((tier) => (
                      <div className={styles.key}>
                        <div
                          className={styles.colorBox}
                          style={{
                            backgroundColor: tier.tierColor,
                            height: "40px",
                            width: "40px",
                          }}
                        ></div>
                        <div className={styles.tierName}>{tier.tierName}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Canvas;
