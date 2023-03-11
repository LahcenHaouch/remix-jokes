import type { ActionArgs } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import invariant from "tiny-invariant";
import { badRequest } from "~/utils/request.server";

import { login } from "~/utils/session.server";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();

  const redirectTo = formData.get("redirectTo");
  const username = formData.get("username");
  const password = formData.get("password");
  const loginRegister = formData.get("loginRegister");

  invariant(typeof username === "string");
  invariant(typeof password === "string");
  invariant(typeof redirectTo === "string");

  console.log("In action");

  if (loginRegister === "login") {
    console.log("In good if");
    console.log(username);
    console.log(password);
    const user = await login(username, password);

    console.log("user", user);

    if (!user) {
      return badRequest({
        errors: "Username/Password combination is incorrect",
      });
    }

    // create user session
    return null;
  } else {
    // const user = await db.user.create({
    //   data: {
    //     username,
    //     passwordHash: await bcrypt.hash(password),
    //   },
    // });

    return null;
  }
}

export default function LoginRoute() {
  const [searchParams] = useSearchParams();

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
            <input type="radio" name="loginRegister" id="login" value="login" />{" "}
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
            />{" "}
            Register
          </label>
        </div>
        <br />
        <div>
          <label htmlFor="name">Username:</label>
          <br />
          <input id="username" name="username" type="text" required />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <br />
          <input id="password" type="password" name="password" required />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
