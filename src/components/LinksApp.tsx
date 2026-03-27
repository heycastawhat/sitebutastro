import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function LinksApp() {
  const links = useQuery(api.links.list);

  if (links === undefined) {
    return <p style={{ color: "var(--ctp-text)" }}>Loading...</p>;
  }

  if (links.length === 0) {
    return <p style={{ color: "var(--ctp-subtext0)" }}>No links yet.</p>;
  }

  const grouped: Record<string, typeof links> = {};
  for (const link of links) {
    const cat = link.category || "Uncategorized";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(link);
  }

  return (
    <div>
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} style={{ marginBottom: "2.5rem" }}>
          <h2
            style={{
              color: "var(--ctp-mauve)",
              fontSize: "1.25rem",
              marginBottom: "1rem",
              borderBottom: "1px solid var(--ctp-surface1)",
              paddingBottom: "0.5rem",
            }}
          >
            {category}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {items.map((link) => (
              <LinkCard key={link._id} link={link} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function LinkCard({
  link,
}: {
  link: {
    _id: string;
    title: string;
    url: string;
    description?: string;
    category?: string;
  };
}) {
  return (
    <div
      style={{
        background: "var(--ctp-surface0)",
        border: "1px solid var(--ctp-surface1)",
        borderRadius: "12px",
        padding: "1.5rem",
        transition: "border-color 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--ctp-mauve)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--ctp-surface1)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <h3 style={{ color: "var(--ctp-text)", margin: "0 0 0.5rem", fontSize: "1.25rem" }}>
        {link.title}
      </h3>
      {link.description && (
        <p
          style={{
            color: "var(--ctp-subtext0)",
            fontSize: "0.9rem",
            lineHeight: 1.5,
            margin: "0 0 0.75rem",
          }}
        >
          {link.description}
        </p>
      )}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "var(--ctp-blue)",
          fontSize: "0.85rem",
          textDecoration: "none",
          wordBreak: "break-all",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLAnchorElement).style.color = "var(--ctp-lavender)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLAnchorElement).style.color = "var(--ctp-blue)";
        }}
      >
        {link.url}
      </a>
    </div>
  );
}
