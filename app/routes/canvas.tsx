import { createReview, postReview } from "~/api/firebase";
import Canvas from "../components/Canvas";
import "../root.module.css";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useCatch,
  useRouteError,
} from "@remix-run/react";
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
  return {};
}

export function ErrorBoundary() {
  const error = useRouteError();

  // when true, this is what used to go to `CatchBoundary`
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>Oops</h1>
        <p>Status: {error.status}</p>
        <p>{error.data.message}</p>
      </div>
    );
  }

  // Don't forget to typecheck with your own logic.
  // Any value can be thrown, not just errors!
  let errorMessage = "Unknown error";

  errorMessage = error.message;

  return (
    <div>
      <h1>Uh oh ...</h1>
      <p>Something went wrong.</p>
      <pre>{errorMessage}</pre>
    </div>
  );
}

export async function action({ request }) {
  const requestObj = await request.json();

  createReview(requestObj.reviewData);

  return json({ ok: true });
}

export default function Index() {
  return (
    <>
      <Canvas />
    </>
  );
}
