import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json, LoaderArgs } from "@remix-run/node";

import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request);
  const jokes = await db.joke.findMany({
    take: 5,
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return json({
    jokes,
    user
  });
}

export default function JokesRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex space-x-56">
      <div>
        <h2 className="text-3xl">Latest jokes:</h2>
        <ul>
          {data.jokes.map((joke) => (
            <li key={joke.id}>
              <Link to={joke.id}>{joke.name}</Link>
            </li>
          ))}
        </ul>
        <Link to="new">Add your own</Link>
      </div>
      <Outlet />
    </div>
  );
}
