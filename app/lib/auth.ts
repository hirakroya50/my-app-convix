import "server-only";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export class RequestAuthError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization) {
    throw new RequestAuthError("Authentication required", 401);
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new RequestAuthError("Invalid authorization header", 401);
  }

  return token;
}

export async function requireAuthenticatedConvex(request: Request) {
  const token = getBearerToken(request);
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  convex.setAuth(token);

  const user = await convex.query(api.users.currentUser);
  if (!user) {
    throw new RequestAuthError("Authentication required", 401);
  }

  return { convex, user };
}
