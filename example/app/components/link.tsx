import { Link as ReactLink } from "react-router";

export default function Link({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <ReactLink
      to={to}
      className="text-blue-500 bg-blue-100 px-2 py-1 rounded-md hover:bg-blue-200 transition-colors inline-block"
    >
      {children}
    </ReactLink>
  );
}

export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      target="_blank"
      href={href}
      rel="noreferrer"
      className="text-blue-700 hover:text-blue-900 transition-colors"
    >
      🔗 {children}
    </a>
  );
}
