import { join } from "node:path";
import { staticPlugin } from "@elysiajs/static";
import { createRequestHandler } from "@remix-run/node";
import type { AppLoadContext } from "@remix-run/node";
import { type AnyElysia, Elysia } from "elysia";
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
 * import { remix } from "elysia-remix";
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
	const buildDirectory = join(cwd, options?.buildDirectory ?? "build");
	const serverBuildPath = join(
		buildDirectory,
		"server",
		options?.serverBuildFile ?? "index.js",
	);

	const elysia = new Elysia({
		name: "elysia-remix",
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
				assets: join(options?.buildDirectory ?? "build", "client"),
				maxAge: 31536000,
				...options?.production?.assets,
			}),
		);
	}

	elysia.all(
		"*",
		async function processRemixSSR(context) {
			const handler = createRequestHandler(
				vite
					? await vite.ssrLoadModule("virtual:remix/server-build")
					: await import(serverBuildPath),
				mode,
			);

			const loadContext = await options?.getLoadContext?.(context);

			return handler(context.request, loadContext);
		},
		{ parse: "none" },
	);

	return elysia;
}
