import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";

import { db } from "~/utils/db.server";

export async function loader() {
  const count = await db.joke.count();
  const randomNumber = Math.floor(Math.random() * count);

  const [randomJoke] = await db.joke.findMany({
    take: 1,
    skip: randomNumber,
    select: {
      id: true,
      name: true,
      content: true,
    },
  });

  if (!randomJoke) {
    throw new Response('No random joke found', { status: 404 });
  }

  return json({
    randomJoke,
  });
}

export default function JokesIndexRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <Link to=".">Get a random joke</Link>
      <h3>Here's a random joke:</h3>
      <blockquote>{data.randomJoke.content}</blockquote>
      <Link to={data.randomJoke.id}>"{data.randomJoke.name}" Permalink</Link>
    </div >
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <div>There are no jokes to display</div>
    )
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary() {
  return (
    <div>
      Something wrong happened
    </div>
  )
}
