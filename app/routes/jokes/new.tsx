import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/node";
import { Link, useActionData, useCatch } from "@remix-run/react";

import { db } from "~/utils/db.server";
import { badRequest } from "~/utils/request.server";
import { getUserId, requireUserId } from "~/utils/session.server";

function validateName(name: string): boolean {
  return name.length >= 5;
}

function validateContent(content: string): boolean {
  return content.length >= 10;
}

export async function action({ request }: ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const name = formData.get("name");
  const content = formData.get("content");

  if (typeof name !== "string" || typeof content !== "string") {
    throw new Error("Form not submitted correctly");
  }

  const isNameValid = validateName(name);
  const isContentValid = validateContent(content);

  if (!isNameValid || !isContentValid) {
    return badRequest({
      fields: {
        name,
        content,
      },
      fieldErrors: {
        name: !isNameValid ? "Name must be at least 5 characters" : null,
        content: !isContentValid
          ? "Content must be at least 10 characters"
          : null,
      },
    });
  }

  const createdJoke = await db.joke.create({
    data: {
      name,
      content,
      userId
    },
  });

  return redirect(`/jokes/${createdJoke.id}`);
}

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    throw new Response('', { status: 401 });
  }

  return json({});
}

export default function NewJokeRoute() {
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <h3>Create new joke</h3>
      <form method="post">
        <div>
          <label htmlFor="name">Name:</label>
          <br />
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={actionData?.fields.name}
            required
          />
          {actionData?.fieldErrors.name && (
            <p>*{actionData.fieldErrors.name}</p>
          )}
        </div>
        <div>
          <label htmlFor="content">Content:</label>
          <br />
          <textarea
            name="content"
            id="content"
            cols={17}
            rows={2}
            defaultValue={actionData?.fields.content}
            required
          />
          {actionData?.fieldErrors.content && (
            <p>*{actionData.fieldErrors.content}</p>
          )}
        </div>
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return (
      <div>
        <p>You must be logged in to create a joke.</p>
        <Link to="/login">Login</Link>
      </div>
    )
  }
}

export function ErrorBoundary() {
  return (
    <div>
      Something unexpected went wrong. Sorry about that.
    </div>
  )
}
