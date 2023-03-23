import { ActionArgs, LoaderArgs, MetaFunction, redirect } from "@remix-run/node";
import { useActionData, useSearchParams } from "@remix-run/react";

import { badRequest } from "~/utils/request.server";
import { createUserSession, findUserByUsername, getUserId, login, register } from "~/utils/session.server";

function validateUsername(username: string) {
  const length = username.length;
  if (length < 6 || length > 10) {
    return 'Usernames must be between 6 and 10 characters'
  }
}

function validatePassword(password: string) {
  const length = password.length;
  if (length < 6 || length > 10) {
    return 'Password must be between 6 and 10 characters'
  }
}

function validateRedirectUrl(url: string): string {
  const validUrls = ['/', '/jokes'];

  if (validUrls.includes(url)) {
    return url;
  }

  return '/jokes';
}

export const meta: MetaFunction = () => ({
  title: 'Remix Jokes | Login',
  description: 'Login to submit your own jokes to Remix Jokes!',
});

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const username = formData.get("username");
  const password = formData.get("password");
  const loginRegister = formData.get("loginRegister");
  const redirectTo = formData.get('redirectTo');

  if (typeof redirectTo !== 'string' || typeof username !== 'string' || typeof password !== 'string' || typeof redirectTo !== 'string') {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: 'Form not submitted correctly'
    });
  }

  const validatedRedirectTo = validateRedirectUrl(redirectTo || '/jokes');

  const fields = { loginRegister, username, password };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  }

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: null,
    });
  }

  switch (loginRegister) {
    case 'login': {
      const user = await login(username, password);

      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: "Username/Password combination is incorrect",
        });
      }

      return createUserSession(user.id, validatedRedirectTo);
    }
    case 'register':
      const userExists = await findUserByUsername(username);

      if (userExists) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: `User with username ${username} already exists`,
        });
      }

      const user = await register(username, password);

      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: 'Something went wrong during new user creation.'
        });
      }

      return createUserSession(user.id, validatedRedirectTo);
    default: {
      return badRequest({
        fieldErrors: null,
        fields,
        formError: 'Login type invalid'
      });
    }
  }
}

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return null;
  }

  return redirect('/jokes');
}

export default function LoginRoute() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();

  return (
    <div>
      <h2>Login</h2>
      <br />
      <form method="post">
        <input
          type="hidden"
          name="redirectTo"
          value={searchParams.get("redirectTo") ?? undefined}
        />
        <div>
          <label htmlFor="login">
            <input
              required
              type="radio"
              name="loginRegister"
              id="login"
              value="login"
              defaultChecked={!actionData?.fields?.loginRegister || actionData.fields.loginRegister === 'login'}
            />{" "}
            Login
          </label>
        </div>
        <div>
          <label htmlFor="register">
            <input
              type="radio"
              name="loginRegister"
              id="register"
              value="register"
              defaultChecked={!actionData?.fields?.loginRegister || actionData.fields.loginRegister === 'register'}
            />{" "}
            Register
          </label>
        </div>
        <br />
        <div>
          <label htmlFor="name">Username:</label>
          <br />
          <input id="username" name="username" type="text" required defaultValue={actionData?.fields?.username} />
          {actionData?.fieldErrors?.username && (
            <p>*{actionData.fieldErrors.username}</p>
          )}
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <br />
          <input id="password" type="password" name="password" required defaultValue={actionData?.fields?.password} />
          {actionData?.fieldErrors?.password && (
            <p>*{actionData.fieldErrors.password}</p>
          )}
        </div>
        <button type="submit">Submit</button>
      </form>
      {actionData?.formError && (
        <p>*{actionData.formError}</p>
      )}
    </div>
  );
}
