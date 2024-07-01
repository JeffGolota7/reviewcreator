import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/Form.module.css";
import { useLoaderData } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";

const Form: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, toggleModal] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [albumDetails, setAlbumDetails] = useState<any | null>(null);
  const navigate = useNavigate();
  const { reviews, accessToken } = useLoaderData();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery !== "") {
        setIsLoading(true);
        const headers = {
          Authorization: `Bearer ${accessToken}`,
        };
        axios
          .get(
            `https://api.spotify.com/v1/search?q=${searchQuery}&type=album`,
            { headers: headers }
          )
          .then((response) => {
            setSearchResults(response.data.albums.items);
          })
          .catch((error) => {
            console.error("Error fetching album details:", error);
            // Handle error
          })
          .finally(() => setIsLoading(false));
      }
    }, 250);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleNext = () => {
    if (albumDetails) {
      navigate("/canvas", { state: { albumDetails } });
    }
  };

  const updateAlbumInfo = (id: number) => {
    if (!isLoading && searchResults.length > 0) {
      setIsLoading(true);
      let album = {
        title: "",
        artist: "",
        trackList: [],
        coverSrc: "",
      };

      setIsLoading(true);
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };
      axios
        .get(`https://api.spotify.com/v1/albums/${id}`, {
          headers: headers,
        })
        .then((response) => {
          album.title = response.data.name;
          album.artist = response.data.artists[0].name;
          album.trackList = response.data.tracks.items.map(
            (track) => track.name
          );
          album.coverSrc = response.data.images[0].url;

          setAlbumDetails(album);
        })
        .catch((error) => {
          console.error("Error fetching album details:", error);
          // Handle error
        })
        .finally(() => {
          setIsLoading(false);
          toggleModal(true);
        });
    }
  };

  return (
    <div className={styles.formContainer}>
      <AnimatePresence>
        {showModal && (
          <motion.div
            className={styles.modalOverlay}
            onClick={(e) => {
              if (!e.target.classList.contains(styles.modal)) {
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
              <div className={styles.albumDetails}>
                <h3 style={{ marginBottom: "10px" }}>Everything Look Right?</h3>
                <div className={styles.topSection}>
                  <img
                    src={albumDetails.coverSrc}
                    style={{
                      maxWidth: "100px",
                      maxHeight: "100px",
                      marginBottom: "10px",
                    }}
                  ></img>
                  <div className={styles.text}>
                    <h5>{`Title: ${albumDetails.title}`}</h5>
                    <h5>{`By: ${albumDetails.artist}`}</h5>
                  </div>
                </div>
                <div className={styles.bottomSection}>
                  <ul
                    style={{ listStyleType: "none" }}
                    className={styles.trackListPreview}
                  >
                    {albumDetails.trackList.map((track, i) => (
                      <li style={{ fontSize: "12px" }}>{`${
                        i + 1
                      }. ${track}`}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <motion.button
                className={styles.nextButton}
                onClick={handleNext}
                disabled={!albumDetails}
                whileHover={{
                  scale: 1.2,
                  transition: { duration: 1 },
                }}
                whileTap={{ scale: 0.9 }}
                style={{ justifySelf: "center" }}
              >
                Time to Review
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className={styles.mainContent}>
        <h3>Search for Album</h3>
        <div className={styles.resultsContainer}>
          <input
            className={`${styles.search} ${
              searchResults.length > 0 ? styles.searchResultsOpen : ""
            }`}
            type="text"
            placeholder="Search for album..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchResults.length > 0 && (
            <ul className={styles.results}>
              {searchResults.map((result: any, index: number) => {
                const date = new Date(result.release_date);
                const days = [
                  "Sunday",
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                ];
                const months = [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ];
                return (
                  <li
                    key={result.id}
                    className={styles.result}
                    onClick={() => updateAlbumInfo(result.id)}
                  >
                    {result.images[0].url && (
                      <img
                        src={result.images[0].url}
                        className={styles.resultImg}
                      />
                    )}

                    <div className={styles.text}>
                      <h4 className={styles.albumTitle}>{result.name}</h4>
                      <h5 className={styles.artist}>
                        {result.artists[0].name}
                      </h5>
                      <p className={styles.resultExtraInfo}>{`Release Date: ${
                        days[date.getDay()]
                      } ${months[date.getMonth()]} ${date.getDate()} - ${
                        result.total_tracks
                      } tracks`}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Form;
