import { OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";

export class CacheDelete extends OpenAPIRoute {
  schema = {
    tags: ["Cache"],
    summary: "Delete a value from cache by key",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        key: Str({
          description: "The key to delete from cache",
          example: "user-profile-123",
        }),
      }),
    },
    responses: {
      "200": {
        description: "Value successfully deleted from cache",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              key: z.string(),
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
      // Check if the key exists before deleting
      const exists = await c.env.CONTENT_CACHE.get(key);

      if (exists === null) {
        return c.json(
          {
            success: false,
            error: "Key not found in cache",
          },
          404
        );
      }

      // Delete the key from KV
      await c.env.CONTENT_CACHE.delete(key);

      return c.json({
        success: true,
        key,
      });
    } catch (error: unknown) {
      return c.json(
        {
          success: false,
          error: `Failed to delete from cache: ${
            (error as Error)?.message || "Unknown error"
          }`,
        },
        500
      );
    }
  }
}
