import { useState } from "react";
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
  const [activeTab, setActiveTab] = useState<"pending" | "approved">("pending");

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

  if (messages === null) {
    return <p style={{ color: "#f38ba8" }}>Access denied.</p>;
  }

  const pending = messages.filter((m) => !m.approved);
  const approved = messages.filter((m) => m.approved);
  const displayedMessages = activeTab === "pending" ? pending : approved;

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

      {/* Stats Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1rem",
        marginBottom: "2rem",
      }}>
        <StatCard label="Total Messages" value={messages.length} color="#89b4fa" />
        <StatCard label="Pending" value={pending.length} color="#f9e2af" />
        <StatCard label="Approved" value={approved.length} color="#a6e3a1" />
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "0.25rem",
        marginBottom: "1.25rem",
        borderBottom: "1px solid #45475a",
      }}>
        <TabButton
          label="Pending"
          count={pending.length}
          active={activeTab === "pending"}
          color="#f9e2af"
          onClick={() => setActiveTab("pending")}
        />
        <TabButton
          label="Approved"
          count={approved.length}
          active={activeTab === "approved"}
          color="#a6e3a1"
          onClick={() => setActiveTab("approved")}
        />
      </div>

      {/* Message List */}
      {displayedMessages.length > 0 ? (
        displayedMessages.map((msg) => (
          <MessageCard
            key={msg._id}
            msg={msg}
            onApprove={activeTab === "pending" ? () => approve({ messageId: msg._id }) : undefined}
            onReject={() => remove({ messageId: msg._id })}
            approved={activeTab === "approved"}
          />
        ))
      ) : (
        <p style={{ color: "#6c7086", textAlign: "center", padding: "2rem 0" }}>
          No {activeTab} messages.
        </p>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      backgroundColor: "#313244",
      border: "1px solid #45475a",
      borderRadius: "10px",
      padding: "1.25rem",
      textAlign: "center",
    }}>
      <div style={{ fontSize: "2rem", fontWeight: "bold", color }}>{value}</div>
      <div style={{ color: "#a6adc8", fontSize: "0.85rem", marginTop: "0.25rem" }}>{label}</div>
    </div>
  );
}

function TabButton({ label, count, active, color, onClick }: {
  label: string;
  count: number;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        borderBottom: active ? `2px solid ${color}` : "2px solid transparent",
        color: active ? "#cdd6f4" : "#6c7086",
        padding: "0.6rem 1rem",
        cursor: "pointer",
        fontWeight: active ? "bold" : "normal",
        fontSize: "0.95rem",
        fontFamily: '"ABeeZee", sans-serif',
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "-1px",
      }}
    >
      {label}
      <span style={{
        backgroundColor: active ? color : "#45475a",
        color: "#1e1e2e",
        fontSize: "0.75rem",
        fontWeight: "bold",
        padding: "1px 7px",
        borderRadius: "9999px",
        lineHeight: "1.4",
      }}>
        {count}
      </span>
    </button>
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
      border: `1px solid ${approved ? "#45475a" : "#f9e2af44"}`,
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
