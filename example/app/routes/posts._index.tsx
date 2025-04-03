import { useLoaderData } from "react-router";
import Link from "~/components/link";
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
    <>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-medium text-gray-600">
          Posts with loader
        </span>
        <Link to="/">Back to home</Link>
      </div>

      <p>The below data is loaded from the loader function on the server.</p>

      <h2 className="text-lg font-bold">🔥🔥 {hotPostName} 🔥🔥</h2>
      <ul className="list-disc list-inside">
        {posts.map((post) => (
          <li key={post.slug}>{post.title}</li>
        ))}
      </ul>
    </>
  );
}
