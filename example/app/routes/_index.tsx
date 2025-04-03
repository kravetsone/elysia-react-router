import Link, { ExternalLink } from "~/components/link";

export default function Index() {
  return (
    <>
      <Link to="/posts">Posts with loader</Link>

      <ul>
        <li>
          {/* TODO: find new react router tutorial */}
          <ExternalLink href="https://remix.run/tutorials/blog">
            15m Quickstart Blog Tutorial
          </ExternalLink>
        </li>
        <li>
          <ExternalLink href="https://remix.run/tutorials/jokes">
            Deep Dive Jokes App Tutorial
          </ExternalLink>
        </li>
        <li>
          <ExternalLink href="https://remix.run/docs">Remix Docs</ExternalLink>
        </li>
      </ul>
    </>
  );
}
