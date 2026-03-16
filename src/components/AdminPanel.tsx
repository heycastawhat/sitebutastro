import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";

export default function AdminPanel() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const isAdmin = useQuery(api.messages.checkAdmin);
  const messages = useQuery(api.messages.list);
  const remove = useMutation(api.messages.remove);

  if (isLoading) return <p style={{ color: "#cdd6f4" }}>Loading...</p>;

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 2rem" }}>
        <h1 style={{ color: "#b4befe", fontSize: "1.8rem", marginBottom: "0.5rem" }}>Admin Panel</h1>
        <p style={{ color: "#a6adc8", marginBottom: "1.5rem" }}>Sign in to access the dashboard.</p>
        <button
          onClick={() => signIn("github", { redirectTo: window.location.href })}
          style={{ ...btn, padding: "10px 20px", fontSize: "1rem" }}
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  if (isAdmin === false) {
    return <p style={{ color: "#f38ba8" }}>Access denied. You are not an admin.</p>;
  }

  if (isAdmin === undefined || messages === undefined) {
    return <p style={{ color: "#cdd6f4" }}>Loading...</p>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1.5rem",
      }}>
        <h1 style={{ color: "#b4befe", fontSize: "1.6rem", margin: 0 }}>Dashboard</h1>
        <button onClick={() => signOut()} style={{ ...btn, fontSize: "0.85rem", padding: "6px 14px" }}>
          Sign Out
        </button>
      </div>

      {/* Stats */}
      <div style={{
        backgroundColor: "#313244",
        border: "1px solid #45475a",
        borderRadius: "10px",
        padding: "1.25rem",
        textAlign: "center",
        marginBottom: "2rem",
      }}>
        <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#89b4fa" }}>{messages.length}</div>
        <div style={{ color: "#a6adc8", fontSize: "0.85rem", marginTop: "0.25rem" }}>Total Messages</div>
      </div>

      {/* Message List */}
      {messages.length > 0 ? (
        messages.map((msg) => (
          <MessageCard
            key={msg._id}
            msg={msg}
            onDelete={() => remove({ messageId: msg._id })}
          />
        ))
      ) : (
        <p style={{ color: "#6c7086", textAlign: "center", padding: "2rem 0" }}>
          No messages yet.
        </p>
      )}
    </div>
  );
}

function MessageCard({ msg, onDelete }: {
  msg: any;
  onDelete: () => void;
}) {
  return (
    <div style={{
      backgroundColor: "#313244",
      border: "1px solid #45475a",
      borderRadius: "10px",
      padding: "1rem 1.25rem",
      marginBottom: "0.75rem",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#89b4fa", fontWeight: "bold", fontSize: "0.9rem" }}>
            {msg.author || "Anonymous"}
            <span style={{ color: "#6c7086", fontWeight: "normal", marginLeft: "0.5rem", fontSize: "0.8rem" }}>
              {new Date(msg._creationTime).toLocaleString()}
            </span>
          </div>
          <p style={{ color: "#cdd6f4", margin: "0.5rem 0 0", whiteSpace: "pre-wrap" }}>{msg.body}</p>
        </div>
        <button onClick={onDelete} style={{ ...btn, backgroundColor: "#f38ba8", color: "#1e1e2e", marginLeft: "1rem", flexShrink: 0 }}>
          ✕
        </button>
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  backgroundColor: "#313244",
  border: "1px solid #45475a",
  color: "#cdd6f4",
  padding: "6px 12px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold",
  fontFamily: '"ABeeZee", sans-serif',
};
