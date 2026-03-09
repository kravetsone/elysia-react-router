import { Elysia } from "elysia";
import { reactRouter } from "../../src";
// import { reactRouter } from "elysia-react-router";

const port = Number(process.env.PORT) || 3000;

new Elysia()
  .use(
    await reactRouter({
      getLoadContext: () => ({ hotPostName: "some post title" }),
    }),
  )
  .get("/some", "Hello")
  .listen(port, () => {
    console.log(
      `Elysia React Router server is running at http://localhost:${port}`,
    );
  });

declare module "react-router" {
  interface AppLoadContext {
    hotPostName: string;
  }
}
