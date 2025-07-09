import { OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";

export class CacheGet extends OpenAPIRoute {
  schema = {
    tags: ["Cache"],
    summary: "Get a value from cache by key",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        key: Str({
          description: "The key to retrieve from cache",
          example: "user-profile-123",
        }),
      }),
    },
    responses: {
      "200": {
        description: "Returns the cached value",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              result: z.any(),
            }),
          },
        },
      },
      "404": {
        description: "Key not found in cache",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              error: z.string(),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    // Get validated data
    const data = await this.getValidatedData<typeof this.schema>();

    // Retrieve the key from params
    const { key } = data.params;

    try {
      // Try to get the value from KV
      const value = await c.env.CONTENT_CACHE.get(key, { type: "json" });

      if (value === null) {
        return c.json(
          {
            success: false,
            error: "Key not found in cache",
          },
          404
        );
      }

      return c.json({
        success: true,
        result: value,
      });
    } catch (error: unknown) {
      return c.json(
        {
          success: false,
          error: `Failed to retrieve from cache: ${
            (error as Error)?.message || "Unknown error"
          }`,
        },
        500
      );
    }
  }
}
