import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";

export default function AdminPanel() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const isAdmin = useQuery(api.messages.checkAdmin);
  const messages = useQuery(api.messages.listAll);
  const approve = useMutation(api.messages.approve);
  const remove = useMutation(api.messages.remove);

  if (isLoading) return <p style={{ color: "#cdd6f4" }}>Loading...</p>;

  if (!isAuthenticated) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <p style={{ color: "#cdd6f4", marginBottom: "1rem" }}>Sign in to access the admin panel.</p>
        <button
          onClick={() => signIn("github", { redirectTo: window.location.href })}
          style={btn}
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

  if (messages === null) {
    return <p style={{ color: "#f38ba8" }}>Access denied.</p>;
  }

  const pending = messages.filter((m) => !m.approved);
  const approved = messages.filter((m) => m.approved);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <span style={{ color: "#a6adc8", fontSize: "0.9rem" }}>
          {pending.length} pending · {approved.length} approved
        </span>
        <button onClick={() => signOut()} style={{ ...btn, fontSize: "0.8rem", padding: "4px 8px" }}>
          Sign Out
        </button>
      </div>

      {pending.length > 0 && (
        <>
          <h2 style={{ color: "#f9e2af", marginBottom: "1rem", fontSize: "1.3rem" }}>Pending Approval</h2>
          {pending.map((msg) => (
            <MessageCard key={msg._id} msg={msg} onApprove={() => approve({ messageId: msg._id })} onReject={() => remove({ messageId: msg._id })} />
          ))}
        </>
      )}

      {approved.length > 0 && (
        <>
          <h2 style={{ color: "#a6e3a1", marginTop: "2rem", marginBottom: "1rem", fontSize: "1.3rem" }}>Approved</h2>
          {approved.map((msg) => (
            <MessageCard key={msg._id} msg={msg} onReject={() => remove({ messageId: msg._id })} approved />
          ))}
        </>
      )}

      {messages.length === 0 && (
        <p style={{ color: "#a6adc8" }}>No messages yet.</p>
      )}
    </div>
  );
}

function MessageCard({ msg, onApprove, onReject, approved }: {
  msg: any;
  onApprove?: () => void;
  onReject: () => void;
  approved?: boolean;
}) {
  return (
    <div style={{
      backgroundColor: "#313244",
      border: `1px solid ${approved ? "#45475a" : "#f9e2af"}`,
      borderRadius: "8px",
      padding: "1rem",
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
        <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem", flexShrink: 0 }}>
          {onApprove && (
            <button onClick={onApprove} style={{ ...btn, backgroundColor: "#a6e3a1", color: "#1e1e2e" }}>
              ✓
            </button>
          )}
          <button onClick={onReject} style={{ ...btn, backgroundColor: "#f38ba8", color: "#1e1e2e" }}>
            ✕
          </button>
        </div>
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
