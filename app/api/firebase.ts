import { db } from "../utils/db.server";
import { doc, setDoc } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore";

export async function getReviews() {
  const querySnapshot = await db.collection("album-reviews").get();
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push({ ...doc.data(), id: doc.id });
  });
  return data;
}

export async function postReview({
  tracklistRatings,
  albumDetails,
  reviewDate,
}) {
  const id = `${albumDetails.title} ${albumDetails.artist}`.replace(" ", "-");

  const albumReviewsRef = await db.collection("album-reviews");

  const docRef = await albumReviewsRef.doc(id);

  await docRef.set({
    id,
    reviewDate,
    rating: tracklistRatings.overallScore,
    coverRating: tracklistRatings.coverScore,
    trackRatings: tracklistRatings.tracks,
    coverArtSrc: albumDetails.coverSrc,
    title: albumDetails.title,
    artist: albumDetails.artist,
  });
}
