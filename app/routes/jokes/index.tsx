import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

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
