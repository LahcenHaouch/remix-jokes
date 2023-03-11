import { createCookieSessionStorage } from "@remix-run/node";
import bcrypt from "bcryptjs";

import { db } from "./db.server";

export async function login(username: string, password: string) {
  const user = await db.user.findUnique({
    where: {
      username,
    },
  });

  if (!user) {
    return null;
  }

  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isCorrectPassword) {
    return null;
  }

  return {
    id: user.id,
    username,
  };
}

export function createUserSession(userId: string, redirectTo: string) {
  const { getSession } = createCookieSessionStorage({});
}
