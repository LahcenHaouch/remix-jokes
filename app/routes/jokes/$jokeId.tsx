import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { db } from "~/utils/db.server";

export async function loader({ params }: LoaderArgs) {
  const id = params.jokeId;

  return json({
    joke: await db.joke.findUnique({
      where: {
        id,
      },
      select: {
        name: true,
        content: true,
      },
    }),
  });
}

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

  if (!data.joke) {
    return <h3>Joke not found!</h3>;
  }

  return (
    <div>
      <h3>{data.joke.name}</h3>
      <blockquote>{data.joke.content}</blockquote>
    </div>
  );
}
