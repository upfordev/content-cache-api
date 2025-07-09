import { fromHono } from "chanfana";
import { Hono } from "hono";
import { CacheGet } from "./endpoints/cacheGet";
import { CachePut } from "./endpoints/cachePut";
import { CacheDelete } from "./endpoints/cacheDelete";
import { CacheList } from "./endpoints/cacheList";
import { createAuthMiddleware } from "./middleware/auth";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Apply authentication middleware only to API routes
app.use("/api/*", (c, next) => {
  // Create the auth middleware with access to the environment
  const authMiddleware = createAuthMiddleware(c.env);
  // Apply the middleware
  return authMiddleware(c, next);
});

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
});
openapi.registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// Register OpenAPI endpoints for KV Cache
openapi.get("/api/cache", CacheList);
openapi.get("/api/cache/:key", CacheGet);
openapi.put("/api/cache/:key", CachePut);
openapi.delete("/api/cache/:key", CacheDelete);

// You may also register routes for non OpenAPI directly on Hono
// app.get('/test', (c) => c.text('Hono!'))

// Export the Hono app
export default app;
