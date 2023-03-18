import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData, useParams } from "@remix-run/react";

import { db } from "~/utils/db.server";

export async function loader({ params }: LoaderArgs) {
  const id = params.jokeId;

  const joke = await db.joke.findUnique({ where: { id }, select: { name: true, content: true } });

  if (!joke) {
    throw new Response('What a joke! Not found', {
      status: 404
    });
  }

  return json({ joke });
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

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();

  if (caught.status === 404) {
    return (
      <div>
        <h3>Huh? What the heck is "{params.jokeId}"?</h3>
      </div>
    )
  }

  throw new Error(`Unhandled error: ${caught.status}`);
}

export function ErrorBoundary() {
  const { jokeId } = useParams();

  return <div>
    <h3>There was an error retrieving joke with id: {jokeId}</h3>
  </div>
}
