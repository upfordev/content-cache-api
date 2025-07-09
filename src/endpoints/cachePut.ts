import { OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../types";

export class CachePut extends OpenAPIRoute {
  schema = {
    tags: ["Cache"],
    summary: "Store a value in cache with a key",
    security: [{ bearerAuth: [] }],
    request: {
      params: z.object({
        key: Str({
          description: "The key to store in cache",
          example: "user-profile-123",
        }),
      }),
      body: {
        content: {
          "application/json": {
            schema: z.object({
              value: z.any(),
              expirationTtl: z.number().optional(),
            }),
          },
        },
      },
    },
    responses: {
      "200": {
        description: "Value successfully stored in cache",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
              key: z.string(),
            }),
          },
        },
      },
      "400": {
        description: "Invalid request",
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

    // Retrieve value and expirationTtl from body
    const body = data.body as { value: any; expirationTtl?: number };
    const { value, expirationTtl } = body;

    try {
      // Store the value in KV
      const options: KVNamespacePutOptions = {};
      if (expirationTtl) {
        options.expirationTtl = expirationTtl;
      }

      await c.env.CONTENT_CACHE.put(key, JSON.stringify(value), options);

      return c.json({
        success: true,
        key,
      });
    } catch (error: any) {
      return c.json(
        {
          success: false,
          error: `Failed to store in cache: ${
            error?.message || "Unknown error"
          }`,
        },
        500
      );
    }
  }
}
