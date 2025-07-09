import { OpenAPIRoute, Str, Num } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";

export class CacheList extends OpenAPIRoute {
  schema = {
    tags: ["Cache"],
    summary: "List keys from cache with optional prefix",
    security: [{ bearerAuth: [] }],
    request: {
      query: z.object({
        prefix: Str({
          description: "Optional prefix to filter keys",
          required: false,
          example: "user-",
        }),
        limit: Num({
          description: "Maximum number of keys to return",
          default: 100,
        }),
        cursor: Str({
          description: "Cursor for pagination",
          required: false,
        }),
      }),
    },
    responses: {
      "200": {
        description: "Returns a list of keys",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              result: z.object({
                keys: z.array(
                  z.object({
                    name: z.string(),
                    expiration: z.number().optional(),
                  })
                ),
                list_complete: z.boolean(),
                cursor: z.string().optional(),
              }),
            }),
          },
        },
      },
    },
  };

  async handle(c: AppContext) {
    // Get validated data
    const data = await this.getValidatedData<typeof this.schema>();

    // Retrieve the query parameters
    const { prefix, limit, cursor } = data.query;

    try {
      // List keys from KV
      const options: KVNamespaceListOptions = {
        limit,
      };

      if (prefix) {
        options.prefix = prefix;
      }

      if (cursor) {
        options.cursor = cursor;
      }

      const result = await c.env.CONTENT_CACHE.list(options);

      // Create the response object with the keys and list_complete properties
      const response: {
        keys: Array<{ name: string; expiration?: number }>;
        list_complete: boolean;
        cursor?: string;
      } = {
        keys: result.keys,
        list_complete: result.list_complete,
      };

      // Only add cursor if it exists in the result
      if ("cursor" in result && result.cursor) {
        response.cursor = result.cursor;
      }

      return c.json({
        success: true,
        result: response,
      });
    } catch (error: any) {
      return c.json(
        {
          success: false,
          error: `Failed to list keys from cache: ${
            error?.message || "Unknown error"
          }`,
        },
        500
      );
    }
  }
}
