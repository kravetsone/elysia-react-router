import { staticPlugin } from "@elysiajs/static";
import type { AppLoadContext } from "@remix-run/node";
import { createRequestHandler } from "@remix-run/node";
import { type AnyElysia, Elysia } from "elysia";
import { join } from "node:path";
import type { ViteDevServer } from "vite";
import type { PluginOptions } from "./types";

/**
 * Initializes and configures an Elysia server with Remix integration.
 *
 * This function sets up the Elysia server to handle Remix SSR (Server-Side Rendering)
 * and optionally integrates Vite for development mode.
 *
 * @deprecated This function will be reworked in future versions.
 * Please use reactRouter for better compatibility and features.
 *
 * @param {PluginOptions<AppLoadContext>} [options] - Optional configuration options for the plugin.
 * @returns {Promise<Elysia>} - A promise that resolves to the configured Elysia instance.
 *
 * @example
 * ```typescript
 * import { remix } from "elysia-react-router/remix";
 *
 * new Elysia()
 *     .use(await remix())
 *     .get("/some", "Hello, world!")
 *     .listen(3000, console.log);
 * ```
 *
 * @see https://remix.run/blog/incremental-path-to-react-19
 */
export async function remix(
    options?: PluginOptions<AppLoadContext>,
): Promise<AnyElysia> {
    const cwd = process.env.REMIX_ROOT ?? process.cwd();
    const mode = options?.mode ?? process.env.NODE_ENV ?? "development";
    const buildDir = options?.buildDirectory ?? "build";
    const buildDirectory = join(cwd, buildDir);
    const serverBuildPath = join(
        buildDirectory,
        "server",
        options?.serverBuildFile ?? "index.js",
    );

    let vite: ViteDevServer | undefined;

    if (mode !== "production") {
        vite = await import("vite").then((vite) => {
            return vite.createServer({
                ...options?.vite,
                server: {
                    ...options?.vite?.server,
                    middlewareMode: true,
                },
            });
        });
    }

    const instance = vite
        ? (await import("elysia-connect-middleware")).connect(vite.middlewares)
        : options?.production?.assets !== false
          ? staticPlugin({
                prefix: "/",
                assets: join(buildDir, "client"),
                maxAge: 31536000,
                ...options?.production?.assets,
            })
          : false;

    const serverModule = vite
        ? () => vite.ssrLoadModule("virtual:remix/server-build")
        : await import(serverBuildPath);

    const handler = createRequestHandler(serverModule, mode);

    return new Elysia({ name: "elysia-remix", seed: options })
        .use(instance)
        .all(
            "*",
            async function processRemixSSR(context) {
                const loadContext = await options?.getLoadContext?.(context);

                return handler(context.request, loadContext);
            },
            { parse: "none" },
        );
}
