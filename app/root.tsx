import type { LinksFunction } from "@remix-run/node"; // or cloudflare/deno
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { cssBundleHref } from "@remix-run/css-bundle";

import globalStylesheetUrl from "./root.css";
import NavBar from "./components/NavBar";

export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  // ...
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        ></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins&display=swap"
          rel="stylesheet"
          crossOrigin="anonymous"
        ></link>
        <meta
          httpEquiv="Content-Security-Policy"
          content="upgrade-insecure-requests"
        />
        <link rel="shortcut icon" href="/assets/images/favicon/favicon.ico" />

        <link
          rel="apple-touch-icon"
          sizes="144x144"
          href="./images/apple-touch-icon.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="./images/favicon-16x16.png"
        />

        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="./images/favicon-32x32.png"
        />

        {/* All meta exports on all routes will go here */}
        <Meta />

        {/* All link exports on all routes will go here */}
        <Links />
      </head>
      <body>
        <NavBar />
        {/* Child routes go here */}
        <Outlet />

        {/* Manages scroll position for client-side transitions */}
        {/* If you use a nonce-based content security policy for scripts, you must provide the `nonce` prop. Otherwise, omit the nonce prop as shown here. */}
        <ScrollRestoration />

        {/* Script tags go here */}
        {/* If you use a nonce-based content security policy for scripts, you must provide the `nonce` prop. Otherwise, omit the nonce prop as shown here. */}
        <Scripts />

        {/* Sets up automatic reload when you change code */}
        {/* and only does anything during development */}
        {/* If you use a nonce-based content security policy for scripts, you must provide the `nonce` prop. Otherwise, omit the nonce prop as shown here. */}
        <LiveReload />
      </body>
    </html>
  );
}
