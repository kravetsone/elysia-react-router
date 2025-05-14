# Elysia React Router and Remix

Use [React Router v7](https://reactrouter.com/home) or [Remix](https://remix.run/) with [Elysia](https://elysiajs.com/) with `HMR` support and `Node` adapter support! Closes a long-standing elysia plugin request https://github.com/elysiajs/elysia/issues/12

> [!IMPORTANT]
>
> [Migration to React Router v7 from Remix](https://reactrouter.com/upgrading/remix).

> [!IMPORTANT]
>
> Currently, Bun has a bug in dev mode with assets. See https://github.com/kravetsone/elysia-react-router/issues/17

### Usage with React Router

In `development` mode it uses [`vite`](https://vitejs.dev/guide/api-javascript.html) under the hood, and in `production` serves the build directory and performs SSR requests.

```ts
import { Elysia } from "elysia";
import { reactRouter } from "elysia-react-router";

new Elysia()
    .use(await reactRouter())
    .get("/some", "Hello, world!")
    .listen(3000, console.log);
```

### Quick start

```bash
bun create react-router@latest --template kravetsone/elysia-react-router/example
```

### Options

| Key              | Type                                                                                    | Default                                 | Description                                                                                                           |
| ---------------- | --------------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| mode?            | "development" \| "production"                                                           | process.env.NODE_ENV \|\| "development" | In `development` mode it starts `vite`, and in `production` it just serves static and performs SSR requests.          |
| basename?        | string                                                                                  | "/"                                     | The base path for the application. This should match the `basename` in your `vite` config.                            |
| buildDirectory?  | string                                                                                  | "build"                                 | The directory where the application is built. This should match the `buildDirectory` directory in your `vite` config. |
| serverBuildFile? | string                                                                                  | "index.js"                              | The server output filename. This should match the `serverBuildFile` filename in your `vite` config.                   |
| vite?            | InlineConfig                                                                            |                                         | Configure `vite` server in `development` mode.                                                                        |
| production?      | { wrapStaticResponse?: (response: ElysiaFile) => MaybePromise<Response \| ElysiaFile> } |                                         | Configure `production` mode options.                                                                                  |
| getLoadContext?  | (context: Context) => AppLoadContext \| Promise<AppLoadContext>                         |                                         | A function that returns the value to use as `context` in route `loader` and `action` functions.                       |

### getLoadContext usage

In Elysia:

<!-- https://reactrouter.com/upgrading/remix#9-update-types-for-apploadcontext -->

```ts
new Elysia()
    .use(
        await reactRouter({
            getLoadContext: () => ({ hotPostName: "some post name" }),
        })
    )
    .listen(port, console.log);

declare module "react-router" {
    interface AppLoadContext {
        hotPostName?: string;
    }
}
```

In React Router:

```tsx
import { useLoaderData } from "react-router";
import type { Route } from "./+types/posts._index";

export const loader = async ({ context }: Route.LoaderArgs) => {
    return {
        ...context,
        posts: [
            {
                slug: "my-first-post",
                title: "My First Post",
            },
            {
                slug: "90s-mixtape",
                title: "A Mixtape I Made Just For You",
            },
        ],
    };
};

export default function Posts() {
    const { posts, hotPostName } = useLoaderData<typeof loader>();

    return (
        <main>
            <h1>Posts</h1>
            <p>🔥🔥 {hotPostName} 🔥🔥</p>
            <ul>
                {posts.map((post) => (
                    <li key={post.slug}>
                        <p>{post.title}</p>
                    </li>
                ))}
            </ul>
        </main>
    );
}
```

### Using with Remix

The `remix` function is deprecated and will be reworked in future versions. Please use `reactRouter` for better compatibility and features. [More info on remix vs react-router v7]
(https://remix.run/blog/incremental-path-to-react-19)

The `remix` function has the same options and types as `reactRouter`. Example usage:

#### Install

```bash
bun i elysia-remix@latest @remix-run/node@latest
```

```ts
import { Elysia } from "elysia";
import { remix } from "elysia-remix";

new Elysia()
    .use(await remix())
    .get("/some", "Hello, world!")
    .listen(3000, console.log);
```

> [!IMPORTANT]
> The Remix functionality will be reworked in future versions, as [Remix plans to release a new reworked version of the framework with new ideas under the old name `Remix`.](https://remix.run/blog/incremental-path-to-react-19)

### Re-exports

```ts
import { remix } from "elysia-remix";
import { reactRouter } from "elysia-remix/react-router";
```

```ts
import { reactRouter } from "elysia-react-router";
import { remix } from "elysia-react-router/remix";
```
