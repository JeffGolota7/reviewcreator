import { db } from "./db.server";

export async function getReviews() {
  const querySnapshot = await db.collection("album-reviews").get();

  const data = [];
  querySnapshot.forEach((doc) => {
    data.push({ ...doc.data(), id: doc.id });
  });

  return data;
}

export async function createReview({
  tracklistRatings,
  overallScore,
  coverScore,
  albumDetails,
  reviewDate,
}) {
  const id = `${albumDetails.title} ${albumDetails.artist}`;

  const lowercaseId = id.toLowerCase();

  const docRef = db
    .collection("album-reviews")
    .doc(lowercaseId.replace(/ /g, "-"));

  await docRef.set({
    id,
    reviewDate,
    rating: overallScore,
    coverRating: coverScore,
    trackRatings: tracklistRatings,
    coverArtSrc: albumDetails.coverSrc,
    title: albumDetails.title,
    artist: albumDetails.artist,
  });
}
