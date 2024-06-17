import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/Form.module.css";

const Form: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [albumDetails, setAlbumDetails] = useState<any | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery !== "") {
        setIsLoading(true);
        axios
          .get(
            `https://musicbrainz.org/ws/2/release?query=${searchQuery}&inc=recordings&fmt=json`
          )
          .then((response) => {
            // Group results by album title and artist
            const uniqueAlbums = {};
            response.data.releases.forEach((release) => {
              const key = `${release.title}-${release["artist-credit"][0].name}`;
              if (!uniqueAlbums[key]) {
                uniqueAlbums[key] = release;
              }
            });
            setSearchResults(Object.values(uniqueAlbums));
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

  const updateAlbumInfo = (index: number) => {
    if (!isLoading && searchResults.length > 0) {
      setIsLoading(true);
      let album = {
        title: "",
        artist: "",
        tracklist: [],
        coverSrc: "",
      };
      axios
        .get(
          `https://musicbrainz.org/ws/2/release/${searchResults[index].id}?inc=recordings&fmt=json`
        )
        .then((response) => {
          album.title = response.data.title;
          album.artist = searchResults[index]["artist-credit"][0].name;
          album.tracklist = response.data.media[0].tracks;
        })
        .catch((error) => {
          console.error("Error fetching album details:", error);
          // Handle error, e.g., show an error message to the user
        })
        .finally(() => {
          setSearchResults([]);
          setIsLoading(false);
        });
      axios
        .get(
          `https://coverartarchive.org/release/${searchResults[index].id}/`,
          {
            params: {
              front: "true", // Ensure front cover
              size: "medium", // Choose a smaller size
            },
          }
        )
        .then((response) => {
          console.log("response - cover", response.data);
          album.coverSrc =
            response.data.images[0].thumbnails.small ??
            response.data.images[0].image;

          setAlbumDetails(album);
        })
        .catch((error) => {
          console.error("Error fetching album details:", error);
          // Handle error, e.g., show an error message to the user
        })
        .finally(() => toggleIsLoading(false));
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Search for Album</h3>
      <div className={styles.resultsContainer}>
        <input
          className={styles.search}
          type="text"
          placeholder="Search for album..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isLoading && <div>Loading...</div>}
        <ul className={styles.results}>
          {searchResults.map((result: any, index: number) => (
            <li
              key={result.id}
              className={styles.result}
              onClick={() => updateAlbumInfo(index)}
            >
              {`${result.title} - ${result["artist-credit"][0].name}`}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.fields}>
        <h3>Or Enter Manually</h3>
        <div className={styles.albumFields}>
          <div className={styles.field}>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              className={styles.input}
              value={albumDetails ? albumDetails.title : ""}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="artist">Artist</label>
            <input
              type="text"
              id="artist"
              className={styles.input}
              value={albumDetails ? albumDetails.artist : ""}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="tracklist">Tracklist</label>
            <textarea
              name="tracklist"
              className={styles.tracklist}
              value={
                albumDetails
                  ? albumDetails.tracklist
                      .map((track: any) => track.title)
                      .join("\n")
                  : ""
              }
            ></textarea>
          </div>
        </div>
      </div>
      <button
        className={styles.nextButton}
        onClick={handleNext}
        disabled={!albumDetails}
      >
        Next
      </button>
    </div>
  );
};

export default Form;
