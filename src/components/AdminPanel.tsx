import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";

export default function AdminPanel() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const isAdmin = useQuery(api.messages.checkAdmin);
  const messages = useQuery(api.messages.list);
  const pending = useQuery(api.messages.listPending);
  const pendingReplies = useQuery(api.messages.listPendingReplies);
  const remove = useMutation(api.messages.remove);
  const approve = useMutation(api.messages.approve);
  const approveReply = useMutation(api.messages.approveReply);
  const removeReply = useMutation(api.messages.removeReply);
  const links = useQuery(api.links.list);
  const addLink = useMutation(api.links.add);
  const removeLink = useMutation(api.links.remove);

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
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{
          flex: 1,
          backgroundColor: "#313244",
          border: "1px solid #45475a",
          borderRadius: "10px",
          padding: "1.25rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#89b4fa" }}>{messages.length}</div>
          <div style={{ color: "#a6adc8", fontSize: "0.85rem", marginTop: "0.25rem" }}>Approved</div>
        </div>
        <div style={{
          flex: 1,
          backgroundColor: "#313244",
          border: "1px solid #45475a",
          borderRadius: "10px",
          padding: "1.25rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#fab387" }}>{pending?.length ?? 0}</div>
          <div style={{ color: "#a6adc8", fontSize: "0.85rem", marginTop: "0.25rem" }}>Pending Messages</div>
        </div>
        <div style={{
          flex: 1,
          backgroundColor: "#313244",
          border: "1px solid #45475a",
          borderRadius: "10px",
          padding: "1.25rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#cba6f7" }}>{pendingReplies?.length ?? 0}</div>
          <div style={{ color: "#a6adc8", fontSize: "0.85rem", marginTop: "0.25rem" }}>Pending Replies</div>
        </div>
      </div>

      {/* Pending Messages */}
      {pending && pending.length > 0 && (
        <>
          <h2 style={{ color: "#fab387", fontSize: "1.2rem", marginBottom: "1rem" }}>Pending Approval</h2>
          {pending.map((msg) => (
            <MessageCard
              key={msg._id}
              msg={msg}
              isPending
              onApprove={() => approve({ messageId: msg._id })}
              onDelete={() => remove({ messageId: msg._id })}
            />
          ))}
        </>
      )}

      {/* Pending Replies */}
      {pendingReplies && pendingReplies.length > 0 && (
        <>
          <h2 style={{ color: "#cba6f7", fontSize: "1.2rem", marginBottom: "1rem" }}>Pending Replies</h2>
          {pendingReplies.map((reply: any) => (
            <div key={reply._id} style={{
              backgroundColor: "#313244",
              border: "1px solid #cba6f7",
              borderRadius: "10px",
              padding: "1rem 1.25rem",
              marginBottom: "0.75rem",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#cba6f7", fontWeight: "bold", fontSize: "0.9rem" }}>
                    {reply.author}
                    <span style={{ color: "#6c7086", fontWeight: "normal", marginLeft: "0.5rem", fontSize: "0.8rem" }}>
                      {new Date(reply._creationTime).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ color: "#6c7086", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    replying to: "{reply.parentBody}"
                  </div>
                  <p style={{ color: "#cdd6f4", margin: "0.5rem 0 0", whiteSpace: "pre-wrap" }}>{reply.body}</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem", flexShrink: 0 }}>
                  <button onClick={() => approveReply({ replyId: reply._id })} style={{ ...btn, backgroundColor: "#a6e3a1", color: "#1e1e2e" }}>
                    ✓
                  </button>
                  <button onClick={() => removeReply({ replyId: reply._id })} style={{ ...btn, backgroundColor: "#f38ba8", color: "#1e1e2e" }}>
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Links Management */}
      <LinksAdmin links={links ?? []} onAdd={addLink} onRemove={removeLink} />

      {/* Approved Messages */}
      <h2 style={{ color: "#89b4fa", fontSize: "1.2rem", marginBottom: "1rem", marginTop: "1.5rem" }}>Approved Messages</h2>
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
          No approved messages yet.
        </p>
      )}
    </div>
  );
}

function MessageCard({ msg, onDelete, onApprove, isPending }: {
  msg: any;
  onDelete: () => void;
  onApprove?: () => void;
  isPending?: boolean;
}) {
  return (
    <div style={{
      backgroundColor: "#313244",
      border: isPending ? "1px solid #fab387" : "1px solid #45475a",
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
          {(msg.siteUrl || msg.buttonUrl) && (
            <div style={{ color: "#6c7086", fontSize: "0.8rem", marginTop: "0.5rem" }}>
              {msg.siteUrl && <span>Site: {msg.siteUrl}</span>}
              {msg.siteUrl && msg.buttonUrl && <span> · </span>}
              {msg.buttonUrl && <span>Button: {msg.buttonUrl}</span>}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem", flexShrink: 0 }}>
          {isPending && onApprove && (
            <button onClick={onApprove} style={{ ...btn, backgroundColor: "#a6e3a1", color: "#1e1e2e" }}>
              ✓
            </button>
          )}
          <button onClick={onDelete} style={{ ...btn, backgroundColor: "#f38ba8", color: "#1e1e2e" }}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function LinksAdmin({ links, onAdd, onRemove }: {
  links: any[];
  onAdd: (args: { title: string; url: string; description?: string; category?: string }) => Promise<any>;
  onRemove: (args: { linkId: any }) => Promise<any>;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    setAdding(true);
    try {
      await onAdd({
        title: title.trim(),
        url: url.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
      });
      setTitle("");
      setUrl("");
      setDescription("");
      setCategory("");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2 style={{ color: "#a6e3a1", fontSize: "1.2rem", marginBottom: "1rem" }}>Cool Links</h2>

      <form onSubmit={handleAdd} style={{
        backgroundColor: "#313244",
        border: "1px solid #45475a",
        borderRadius: "10px",
        padding: "1rem",
        marginBottom: "1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required
            style={inputStyle} />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL" required type="url"
            style={inputStyle} />
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)"
            style={inputStyle} />
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (optional)"
            style={inputStyle} />
        </div>
        <button type="submit" disabled={adding} style={{ ...btn, alignSelf: "flex-start", backgroundColor: "#a6e3a1", color: "#1e1e2e" }}>
          {adding ? "Adding..." : "Add Link"}
        </button>
      </form>

      {links.map((link) => (
        <div key={link._id} style={{
          backgroundColor: "#313244",
          border: "1px solid #45475a",
          borderRadius: "10px",
          padding: "0.75rem 1rem",
          marginBottom: "0.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <span style={{ color: "#cdd6f4", fontWeight: "bold" }}>{link.title}</span>
            {link.category && <span style={{ color: "#6c7086", marginLeft: "0.5rem", fontSize: "0.8rem" }}>({link.category})</span>}
            <div style={{ color: "#89b4fa", fontSize: "0.8rem" }}>{link.url}</div>
            {link.description && <div style={{ color: "#a6adc8", fontSize: "0.8rem" }}>{link.description}</div>}
          </div>
          <button onClick={() => onRemove({ linkId: link._id })} style={{ ...btn, backgroundColor: "#f38ba8", color: "#1e1e2e" }}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "6px 10px",
  backgroundColor: "#1e1e2e",
  border: "1px solid #45475a",
  borderRadius: "6px",
  color: "#cdd6f4",
  fontFamily: '"ABeeZee", sans-serif',
  fontSize: "0.85rem",
};

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
