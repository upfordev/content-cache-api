import { bearerAuth } from "hono/bearer-auth";

/**
 * Creates a bearer authentication middleware using Hono's built-in bearerAuth
 *
 * @param env - The environment containing the API_TOKEN
 * @returns A configured bearer auth middleware
 */
export function createAuthMiddleware(env: { API_TOKEN?: string }) {
  // Use the API_TOKEN from environment
  const token = env.API_TOKEN;

  return bearerAuth({ token });
}
