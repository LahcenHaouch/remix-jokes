import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";

import { db } from "~/utils/db.server";

export async function loader() {
  // redirect if user is not logged in

  return json({
    jokes: await db.joke.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  });
}

export default function JokesRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <h2>Latest jokes:</h2>
      <ul>
        {data.jokes.map((joke) => (
          <li key={joke.id}>
            <Link to={joke.id}>{joke.name}</Link>
          </li>
        ))}
      </ul>
      <Link to="new">Add your own</Link>
      <hr />
      <Outlet />
    </div>
  );
}
