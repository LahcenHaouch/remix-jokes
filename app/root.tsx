import { json, LinksFunction, LoaderArgs, MetaFunction } from "@remix-run/node";
import { Meta, Links, LiveReload, Outlet, useCatch, Link, useLoaderData } from "@remix-run/react";
import { ReactNode } from "react";

import stylesheet from '~/tailwind.css'
import { getUser } from "./utils/session.server";

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
];

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request);

  return json({
    user,
  });
}

export default function App() {
  const data = useLoaderData<typeof loader>();

  return (
    <Document
      title="Remix Jokes"
    >
      {data.user && (<div className="flex justify-end gap-x-2">
        {data.user.username}
        <form action="/logout" method="post">
          <button type="submit">Logout</button>
        </form>
      </div>)}
      <h1 className="text-5xl mb-16"><Link to="/jokes">Remix Jokes</Link></h1>
      <Outlet />
    </Document>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (<Document
    title={`${caught.status} ${caught.statusText}`}
  >
    <h1 className="text-center text-xl">{caught.status} {caught.statusText}</h1>
  </Document >)
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <Document title="Ouups">
      <h1 className="text-center text-xl">App Error</h1>
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
      <body className="p-16  bg-rose-200">
        {children}
        <LiveReload />
      </body>
    </html>
  )
}
