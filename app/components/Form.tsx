import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/Form.module.css";

const Form: React.FC = () => {
  const [reviewType, setReviewType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, toggleIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any>([]);
  const [albumDetails, setAlbumDetails] = useState<any | null>(null);
  const navigate = useNavigate();

  const handleNext = () => {
    if (albumDetails) {
      navigate("/canvas", { state: { albumDetails } });
    }
  };

  const updateAlbumInfo = (index: number) => {
    if (!isLoading && searchResults.length > 0) {
      toggleIsLoading(true);
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
          console.log("response", response.data);

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
          toggleIsLoading(false);
        });
      axios
        .get(`https://coverartarchive.org/release/${searchResults[index].id}`)
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

  const handleText = (query: string) => {
    setSearchQuery(query);
    if (searchQuery !== "") {
      setSearchResults([]);
      if (!isLoading) {
        toggleIsLoading(true);
        axios
          .get(
            `https://musicbrainz.org/ws/2/release?query=${searchQuery}&inc=recordings&fmt=json`
          )
          .then((response) => {
            setSearchResults(response.data.releases);
          })
          .catch((error) => {
            console.error("Error fetching album details:", error);
          })
          .finally(() => toggleIsLoading(false));
      }
    }
  };

  return (
    <div className={styles.formContainer}>
      <h3>Search for Album</h3>
      <div className={styles.resultsContainer}>
        <input
          className={styles.search}
          type="text"
          onChange={(e) => handleText(e.target.value)}
        />
        <ul className={styles.results}>
          {searchResults &&
            searchResults.map((result: any, index: number) => (
              <li
                className={styles.result}
                onClick={() => updateAlbumInfo(index)}
              >{`${result.title} - ${result["artist-credit"][0].name}`}</li>
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
      <div className={styles.nextButton} onClick={handleNext}>
        Next
      </div>
    </div>
  );
};

export default Form;
