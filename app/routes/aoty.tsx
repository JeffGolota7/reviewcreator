import "../root.module.css";
import { getReviews } from "~/api/firebase";
import AOTYRankings from "~/components/AOTYRankings";
export function headers({
  loaderHeaders,
  parentHeaders,
}: {
  loaderHeaders: Headers;
  parentHeaders: Headers;
}) {
  return {
    // This is an example of how to set caching headers for a route
    // For more info on headers in Remix, see: https://remix.run/docs/en/v1/route/headers
    "Cache-Control": "public, max-age=60, s-maxage=60",
  };
}
export async function loader() {
  const reviews = await getReviews();

  return { reviews };
}

export default function Index() {
  return <AOTYRankings />;
}
