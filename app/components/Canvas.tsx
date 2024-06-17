import React, { useEffect, useRef, useState } from "react";
import { domToPng } from "modern-screenshot";
import domtoimage from "dom-to-image";
import { useLocation } from "@remix-run/react";
import styles from "../styles/Canvas.module.css";

const Canvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [tracklistRatings, updateTracks] = useState([{}]);
  const [albumDetails, setAlbumDetails] = useState<any | null>(
    location.state && location.state.albumDetails
  );
  const [overallScore, updateOverallScore] = useState(0);
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
    containerWidth: number,
    numberOfTracks: number
  ) => {
    const maxFontSize = 40;
    const minFontSize = 10;

    // Adjust these values based on your specific needs
    const maxWidth = 100; // 70% of the canvas width
    const minWidth = 20; // Minimum width for the container

    const adjustedContainerWidth = Math.max(
      minWidth,
      (maxWidth / 100) * containerWidth
    );

    return `${Math.max(
      minFontSize,
      Math.min(maxFontSize, adjustedContainerWidth / numberOfTracks)
    )}px`;
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
        albumDetails.tracklist.forEach((trackName: any) => {
          tracklistRatingsTemp.push({
            name: trackName.title,
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

  const handleDownload = async () => {
    const canvasContainer = containerRef.current;

    if (canvasContainer) {
      setIsDownloading(true);
      try {
        // Use dom-to-image to capture the content of the canvasContainer
        // domToPng(canvasContainer, { allowTaint: true, useCORS: true }).then(
        //   (dataUrl) => {
        //     const link = document.createElement("a");
        //     link.download = `${albumDetails.title}.png`;
        //     link.href = dataUrl;
        //     link.click();
        //   }
        // );
        // domtoimage
        //   .toPng(canvasContainer)
        //   .then(function (dataUrl) {
        //     const link = document.createElement("a");
        //     link.download = `${albumDetails.title}.png`;
        //     link.href = dataUrl;
        //     link.click();
        //   })
        //   .catch(function (error) {
        //     console.error("oops, something went wrong!", error);
        //   });
        domtoimage
          .toPng(canvasContainer)
          .then(function (dataUrl) {
            var img = new Image();
            img.onload = function () {
              document.body.appendChild(img);
            };
            img.onerror = function (error) {
              console.error("Failed to load image", error);
            };
            img.src = dataUrl;
          })
          .catch(function (error) {
            console.error("oops, something went wrong!", error);
          });
      } catch (error) {
        console.error("Error generating canvas:", error);
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

  const handleRatingChange = (e, index, isTrack) => {
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
      updateOverallScore(e.currentTarget.innerText);
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
                handleRatingChange(e, 0, false);
              }}
              onClick={handleTrackRatingClick}
            >{`${overallScore}`}</span>
            {`/10`}
          </h2>
        </div>
        <div className={styles.buttons}>
          <input
            type="file"
            accept="image/*"
            onChange={handleBackgroundImageChange}
          />
          <button onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? "Downloading..." : "Download Image"}
          </button>
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
            <h2 className={styles.title}>{`${
              albumDetails ? albumDetails.artist : ""
            } - ${albumDetails ? albumDetails.title : ""}`}</h2>
            <div className={styles.albumDetails}>
              <div className={styles.left}>
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
                        containerRef.current?.offsetWidth || 1080, // Use container width or fallback to canvas width
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
                        0
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
