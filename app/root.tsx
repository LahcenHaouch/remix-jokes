import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { Meta, Links, LiveReload, Outlet, useCatch, Link } from "@remix-run/react";
import { ReactNode } from "react";

import stylesheet from '~/tailwind.css'

export function meta(): ReturnType<MetaFunction> {
  return {
    title: 'Remix Jokes',
    charset: 'utf-8',
    description: 'Jokes and stuff'
  }
}

export const links: LinksFunction = () => [
  {
    rel: 'stylesheet', href: stylesheet
  }
]

export default function App() {
  return (
    <Document
      title="Remix Jokes"
    >
      <h1><Link to="/jokes">Remix Jokes</Link></h1>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (<Document
    title={`${caught.status} ${caught.statusText}`}
  >
    <h1>J{caught.status} {caught.statusText}</h1>
  </Document >)
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="Ouups">
      <h1>App Error</h1>
      <pre>{error.message}</pre>
    </Document>
  )
}

type DocumentProps = {
  title: string;
  children: ReactNode;
}

function Document({ title, children }: DocumentProps) {
  return (
    <html>
      <head>
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <LiveReload />
      </body>
    </html>
  )
}
