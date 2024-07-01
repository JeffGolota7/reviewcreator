import { json } from "@remix-run/node";
import Form from "../components/Form";
import "../root.module.css";
import { getReviews } from "~/api/firebase";
export function headers({
  loaderHeaders,
  parentHeaders,
}: {
  loaderHeaders: Headers;
  parentHeaders: Headers;
}) {
  console.log(
    "This is an example of how to set caching headers for a route, feel free to change the value of 60 seconds or remove the header"
  );
  return {
    // This is an example of how to set caching headers for a route
    // For more info on headers in Remix, see: https://remix.run/docs/en/v1/route/headers
    "Cache-Control": "public, max-age=60, s-maxage=60",
  };
}
export async function loader() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  let accessToken;
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
  };

  try {
    const response = await fetch(
      "https://accounts.spotify.com/api/token",
      requestOptions
    );
    const data = await response.json();
    accessToken = data.access_token;
  } catch (error) {
    console.error("Error:", error);
    return json({ error: "Failed to fetch access token" }, { status: 500 });
  }

  const reviews = await getReviews();

  return { reviews, accessToken };
}

export default function Index() {
  return (
    <>
      <Form />
    </>
  );
}
