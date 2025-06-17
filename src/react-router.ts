import { join } from "node:path";
import { type AnyElysia, Elysia, type InferContext, file } from "elysia";
import { type AppLoadContext, createRequestHandler } from "react-router";

import { staticPlugin } from "@elysiajs/static";
import type { ViteDevServer } from "vite";
import type { PluginOptions } from "./types";
import { universalGlob } from "./utils";

/**
 * Initializes and configures an Elysia server with React Router integration.
 *
 * This function sets up the Elysia server to handle React Router SSR (Server-Side Rendering)
 * and optionally integrates Vite for development mode.
 *
 * @param {PluginOptions<AppLoadContext>} [options] - Optional configuration options for the plugin.
 * @returns {Promise<Elysia>} - A promise that resolves to the configured Elysia instance.
 *
 * @example
 * ```typescript
 * import { reactRouter } from "elysia-remix";
 *
 * new Elysia()
 *     .use(await reactRouter())
 *     .get("/some", "Hello, world!")
 *     .listen(3000, console.log);
 * ```
 */
export async function reactRouter(
	options?: PluginOptions<AppLoadContext>,
): Promise<AnyElysia> {
	const cwd = process.env.REMIX_ROOT ?? process.cwd();
	const mode = options?.mode ?? process.env.NODE_ENV ?? "development";
	const buildDirectory = join(cwd, options?.buildDirectory ?? "build");
	const serverBuildPath = join(
		buildDirectory,
		"server",
		options?.serverBuildFile ?? "index.js",
	);

	const elysia = new Elysia({
		name: "elysia-react-router",
		seed: options,
	});

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

	if (vite) {
		elysia.use(
			(await import("elysia-connect-middleware")).connect(vite.middlewares),
		);
	} else if (options?.production?.assets !== false) {
		elysia.use(
			staticPlugin({
				prefix: "/",
				assets: "build/client",
				headers: { "Cache-Control": "public, max-age=31536000, immutable" },
				...options?.production?.assets,
			}),
		);
	}

	elysia.all("*", async function processReactRouterSSR(context) {
		const handler = createRequestHandler(
			vite
				? await vite.ssrLoadModule("virtual:react-router/server-build")
				: await import(serverBuildPath),
			mode,
		);

		const loadContext = await options?.getLoadContext?.(context);

		return handler(context.request, loadContext);
	});

	return elysia;
}
