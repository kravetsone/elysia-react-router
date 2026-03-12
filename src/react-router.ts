import { staticPlugin } from "@elysiajs/static";
import { Elysia, type AnyElysia } from "elysia";
import { join } from "node:path";
import {
  createRequestHandler,
  RouterContextProvider,
  type AppLoadContext,
} from "react-router";
import type { ViteDevServer } from "vite";
import type { PluginOptions } from "./types";

/**
 * Initializes and configures an Elysia server with React Router integration.
 *
 * This function sets up the Elysia server to handle React Router SSR (Server-Side Rendering)
 * and optionally integrates Vite for development mode.
 *
 * @param {PluginOptions<T>} [options] - Optional configuration options for the plugin.
 * @returns {Promise<Elysia>} - A promise that resolves to the configured Elysia instance.
 *
 * @example
 * ```typescript
 * import { reactRouter } from "elysia-react-router";
 *
 * new Elysia()
 *     .use(await reactRouter())
 *     .get("/some", "Hello, world!")
 *     .listen(3000, console.log);
 * ```
 */
export async function reactRouter(
  options?: PluginOptions<RouterContextProvider | AppLoadContext>,
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
    ? await vite.ssrLoadModule("virtual:react-router/server-build")
    : await import(serverBuildPath);

  const handler = createRequestHandler(serverModule, mode);

  return new Elysia({ name: "elysia-react-router", seed: options })
    .use(instance)
    .all(
      "*",
      async function processReactRouterSSR(context) {
        const loadContext = await options?.getLoadContext?.(context);

        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        return handler(context.request, loadContext as any);
      },
      { parse: "none" },
    );
}
