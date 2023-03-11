import type { LinksFunction } from "@remix-run/node";
import { Links, LiveReload, Outlet } from "@remix-run/react";

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: "https://fonts.xz.style/serve/inter.css",
    },
    {
      rel: "stylesheet",
      href: "https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css",
    },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Remix Jokes</title>
        <Links />
      </head>
      <body>
        <h1>Remix Jokes</h1>
        <Outlet />
        <LiveReload />
      </body>
    </html>
  );
}
