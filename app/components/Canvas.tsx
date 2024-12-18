import React, { useEffect, useRef, useState } from "react";
import domtoimage from "dom-to-image";
import { useLocation, useSubmit } from "@remix-run/react";
import styles from "../styles/Canvas.module.css";
import { motion } from "framer-motion";
import Slider from "./Slider";
import { createReview } from "~/api/db.server";
import Modal from "./Modal";

const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [tracklistRatings, updateTracks] = useState([]);
  const [albumDetails, setAlbumDetails] = useState<any | null>(
    location.state && location.state.albumDetails
  );
  const submit = useSubmit();
  const [overallScore, updateOverallScore] = useState(0);
  const [coverScore, updateCoverScore] = useState(0);
  const [showModal, toggleModal] = useState(false);
  let run = false;
  const [isDownloading, setIsDownloading] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  const songTiers = [
    { tierName: "Average", tierColor: "#FFFFFF", range: ["4", "5", "6"] },
    { tierName: "Good", tierColor: "#6FE17E", range: ["7", "8", "9"] },
    { tierName: "Favorite", tierColor: "#EDF12F" },
    { tierName: "Skit/Interlude", tierColor: "#12B1B8" },
    { tierName: "Bad", tierColor: "#F7200E", range: ["0", "1", "2", "3"] },
  ];

  const calculateFontSize = (
    containerHeight: number,
    numberOfTracks: number
  ) => {
    const maxFontSize = 36; // Maximum font size
    const minFontSize = 10; // Minimum font size

    // Calculate the available height per item
    const availableHeightPerItem = containerHeight / numberOfTracks;

    // Ensure the calculated font size is within the defined min and max limits
    const fontSize = Math.max(
      minFontSize,
      Math.min(maxFontSize, availableHeightPerItem)
    );

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
        JSON.parse(savedAlbumDetails)?.title === albumDetails.title
      ) {
        setAlbumDetails(JSON.parse(savedAlbumDetails));
        updateTracks(JSON.parse(savedTracklistRatings));
        updateOverallScore(parseInt(savedOverallScore));
      } else {
        const tracklistRatingsTemp = [];
        albumDetails.trackList.forEach((trackName: any) => {
          tracklistRatingsTemp.push({
            name: trackName,
            rating: 5,
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

      try {
        const dataUrl = await domtoimage.toPng(containerElement, {
          width: 1080,
          height: 1920,
          style: {
            width: "1080px",
            height: "1920px",
          },
        });

        // Remove any existing images inside the modal
        while (modal?.firstChild) {
          modal?.removeChild(modal?.firstChild);
        }

        // Create and append the new image

        const img = new Image(); //MIGHT HAVE TO REVERT THIS BUT WE'LL SEE
        img.style.width = "100%";
        img.style.height = "auto";
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

      songTiers.forEach((tier) => {
        if (tier.range) {
          if (tier.range.includes(e.currentTarget.innerText)) {
            trackRatings[index].tier = tier;
          }
        }
      });

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

  const handleSlider = (index, rating) => {
    if (tracklistRatings.length > 1) {
      const trackRatings = [...tracklistRatings];

      if (trackRatings.length > 1) {
        let totalScore = 0;

        trackRatings[index].rating = rating;

        songTiers.forEach((tier) => {
          if (tier.range) {
            if (tier.range.includes(rating.toString())) {
              trackRatings[index].tier = tier;
            }
          }
        });

        updateTracks(trackRatings);

        tracklistRatings.forEach((track) => {
          if (track.tier.tierName !== "Skit/Interlude")
            totalScore = parseInt(totalScore) + parseInt(track.rating);
        });

        const averageScore = Math.round(totalScore / trackRatings.length);
        updateOverallScore(averageScore);
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
      {showModal && (
        <Modal showModal={showModal} toggleModal={toggleModal}>
          <div className={styles.modalContent}>
            <div className={styles.resultImg} ref={modalRef}></div>
            <div className={styles.modalButtons}>
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
              <motion.button
                className={styles.button}
                disabled={!albumDetails}
                whileHover={{
                  scale: 1.2,
                  transition: { duration: 1 },
                }}
                whileTap={{ scale: 0.9 }}
                style={{ justifySelf: "center" }}
                onClick={() => {
                  const date = new Date();

                  submit(
                    {
                      reviewData: {
                        tracklistRatings,
                        overallScore,
                        coverScore,
                        albumDetails,
                        reviewDate: date.toISOString(),
                      },
                    },
                    { method: "post", encType: "application/json" }
                  );
                }}
              >
                Save Review
              </motion.button>
            </div>
          </div>
        </Modal>
      )}
      <div className={styles.ratingControls}>
        <div className={styles.topAlbumSection}>
          <img
            src={albumDetails ? albumDetails.coverSrc : ""}
            alt=""
            className={styles.mainCover}
          />
          <div className={styles.albumText}>
            <div className={styles.albumTextContent}>
              {albumDetails?.title && (
                <h2 className={styles.mainTitle}>{albumDetails.title}</h2>
              )}
              {albumDetails?.artist && (
                <p className={styles.artistTitle}>{albumDetails.artist}</p>
              )}

              <div className={styles.buttons}>
                <label className={styles.uploadLabel}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundImageChange}
                  />
                  Upload Background
                </label>
                <button
                  className={styles.button}
                  onClick={() => toggleModal(true)}
                  disabled={isDownloading}
                >
                  {isDownloading ? "Downloading..." : "Generate Image"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.trackRatings}>
          <div className={styles.biggerRatings}>
            <h2 className={styles.overall}>
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
            <h2 className={styles.coverRating}>
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
          <ul>
            {tracklistRatings &&
              tracklistRatings.map((track, index) => {
                return (
                  <li
                    className={styles.trackRatingControl}
                    key={track.name}
                    style={{
                      borderBottom:
                        index !== tracklistRatings.length - 1
                          ? "1px dotted rgb(67, 67, 67)"
                          : "",
                    }}
                  >
                    <span
                      style={{
                        color: track?.tier?.tierColor
                          ? track.tier.tierColor
                          : "#FFFFFF",
                      }}
                      onClick={() => handleTrackClick(track, index)}
                    >
                      {track.name}
                    </span>
                    <Slider
                      sliderChange={(rating) => handleSlider(index, rating)}
                      value={track.rating}
                    />
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
      <div className={styles.canvasContainer} style={{ display: "none" }}>
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
            <h2 className={styles.title} style={{ marginTop: "200px" }}>{`${
              albumDetails ? albumDetails?.artist : ""
            } - ${albumDetails ? albumDetails?.title : ""}`}</h2>
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
                    <div className={styles.coverRatingText}>
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
