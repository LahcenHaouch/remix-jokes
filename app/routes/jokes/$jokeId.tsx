import { ActionArgs, LoaderArgs, redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData, useParams } from "@remix-run/react";

import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

export async function action({ params, request }: ActionArgs) {
  const form = await request.formData();

  const intent = form.get('intent');

  if (intent !== 'delete') {
    throw new Response(`The intent ${intent} is not supported`, { status: 400 });
  }

  const userId = await requireUserId(request);
  const joke = await db.joke.findUnique({ where: { id: params.jokeId } });

  if (!joke) {
    throw new Response('Can\'t delete what doesnt exist', { status: 404 });
  }

  if (joke.userId !== userId) {
    throw new Response('Pssh, nice try. That\'s not your joke', { status: 403 });
  }

  await db.joke.delete({ where: { id: params.jokeId } });
  return redirect('/jokes');
}

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
      <div>
        <h3>{data.joke.name}</h3>
        <form method="post">
          <button name="intent" value="delete">Delete</button>
        </form>
      </div>
      <blockquote>{data.joke.content}</blockquote>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();

  switch (caught.status) {
    case 400: {
      return (
        <div>
          <h3>What you tried to do is not allowed!</h3>
        </div>
      );
    }
    case 403: {
      return (
        <div>
          <h3>Sorry, but {params.jokeId} is not your joke.</h3>
        </div>
      );
    }
    case 404: {
      return (
        <div>
          <h3>Huh? What the heck is "{params.jokeId}"?</h3>
        </div>
      );
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
}

export function ErrorBoundary() {
  const { jokeId } = useParams();

  return <div>
    <h3>There was an error retrieving joke with id: {jokeId}</h3>
  </div>
}
