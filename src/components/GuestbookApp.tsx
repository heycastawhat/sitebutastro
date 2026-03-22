import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";

const win95Styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    animation: "win95FadeIn 0.15s ease",
  },
  dialog: {
    background: "#c0c0c0",
    border: "2px solid",
    borderColor: "#dfdfdf #808080 #808080 #dfdfdf",
    boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #000, 4px 4px 0 rgba(0,0,0,0.3)",
    minWidth: 300,
    maxWidth: 400,
    fontFamily: '"ABeeZee", sans-serif',
  },
  titlebar: {
    background: "linear-gradient(90deg, #000080 0%, #1084d7 100%)",
    color: "white",
    padding: "4px 6px",
    fontWeight: "bold",
    fontSize: "0.85rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeBtn: {
    background: "#c0c0c0",
    border: "2px solid",
    borderColor: "#dfdfdf #808080 #808080 #dfdfdf",
    padding: "0 4px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.7rem",
    lineHeight: 1,
    color: "#000",
  },
  body: {
    padding: "1.25rem",
    display: "flex",
    gap: "1rem",
    alignItems: "flex-start",
    color: "#000",
  },
  icon: {
    fontSize: "2rem",
    flexShrink: 0,
  },
  okBtn: {
    backgroundColor: "#c0c0c0",
    border: "2px solid",
    borderColor: "#dfdfdf #808080 #808080 #dfdfdf",
    boxShadow: "inset 1px 1px 0 #fff, inset -1px -1px 0 #000",
    padding: "4px 24px",
    cursor: "pointer",
    fontWeight: "bold",
    fontFamily: '"ABeeZee", sans-serif',
    color: "#000",
  },
  footer: {
    padding: "0 1.25rem 1rem",
    display: "flex",
    justifyContent: "center",
  },
};

function Win95Dialog({ title, message, icon, onClose }: {
  title: string;
  message: string;
  icon: string;
  onClose: () => void;
}) {
  return (
    <div style={win95Styles.overlay} onClick={onClose}>
      <div style={win95Styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div style={win95Styles.titlebar}>
          <span>{title}</span>
          <button style={win95Styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={win95Styles.body}>
          <span style={win95Styles.icon}>{icon}</span>
          <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.4 }}>{message}</p>
        </div>
        <div style={win95Styles.footer}>
          <button style={win95Styles.okBtn} onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
}

export default function GuestbookApp() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const viewer = useQuery(api.messages.viewer);
  const messages = useQuery(api.messages.list);
  const sendMessage = useMutation(api.messages.send);
  const isAdmin = useQuery(api.messages.checkAdmin);
  const removeMessage = useMutation(api.messages.remove);

  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dialog, setDialog] = useState<{ title: string; message: string; icon: string } | null>(null);
  const wasAuthenticated = useRef(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && !wasAuthenticated.current && viewer?.name) {
      setDialog({
        title: "Welcome!",
        message: `G'day ${viewer.name}! You've successfully signed in. You can now leave a message in the guestbook.`,
        icon: "🖥️",
      });
    }
    if (!isLoading) {
      wasAuthenticated.current = isAuthenticated;
    }
  }, [isAuthenticated, isLoading, viewer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setIsSubmitting(true);
    try {
      await sendMessage({ body });
      setBody("");
      setSubmitted(true);
      setDialog({
        title: "Message Sent!",
        message: "Your message has been added to the guestbook. Thanks for signing!",
        icon: "✉️",
      });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error(err);
      alert("Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="guestbook-container">
      {dialog && (
        <Win95Dialog
          title={dialog.title}
          message={dialog.message}
          icon={dialog.icon}
          onClose={() => setDialog(null)}
        />
      )}
      <div className="win98-window message-form-container">
        <div className="win98-titlebar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Sign the Guestbook</h2>
          {isAuthenticated && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "0.65rem", opacity: 0.9 }}>
                G'day {viewer?.name}, you're signed in with {viewer?.provider}
              </span>
              <button
                onClick={() => signOut()}
                style={{ fontSize: "0.7rem", padding: "2px 4px", cursor: "pointer" }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
        <div className="form-content" style={{ padding: "1rem", backgroundColor: "#c0c0c0", color: "#000" }}>
          {isLoading ? (
            <p>Loading...</p>
          ) : isAuthenticated ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a nice message..."
                required
                rows={3}
                style={{
                  padding: "0.5rem",
                  border: "2px solid",
                  borderColor: "#808080 #dfdfdf #dfdfdf #808080",
                  backgroundColor: "white",
                  color: "black",
                  fontFamily: '"ABeeZee", sans-serif',
                  boxShadow: "inset 1px 1px 0 #000000, inset -1px -1px 0 #ffffff"
                }}
              />
              {submitted && (
                <p style={{ color: "#008000", fontWeight: "bold", margin: 0 }}>
                  Message sent!
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: "#c0c0c0",
                  border: "2px solid",
                  borderColor: "#dfdfdf #808080 #808080 #dfdfdf",
                  boxShadow: "inset 1px 1px 0 #ffffff, inset -1px -1px 0 #000000",
                  padding: "0.5rem",
                  cursor: isSubmitting ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  fontFamily: '"ABeeZee", sans-serif',
                  marginTop: "0.5rem",
                  color: isSubmitting ? "#808080" : "black"
                }}
              >
                {isSubmitting ? "Sending..." : "Sign"}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <p style={{ marginBottom: "1rem" }}>Sign in to leave a message!</p>
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  onClick={() => signIn("github", { redirectTo: window.location.href })}
                  style={{
                    backgroundColor: "#c0c0c0",
                    border: "2px solid",
                    borderColor: "#dfdfdf #808080 #808080 #dfdfdf",
                    boxShadow: "inset 1px 1px 0 #ffffff, inset -1px -1px 0 #000000",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontFamily: '"ABeeZee", sans-serif',
                    color: "black"
                  }}
                >
                  Sign in with GitHub
                </button>
                <button
                  onClick={() => signIn("hackclub", { redirectTo: window.location.href })}
                  style={{
                    backgroundColor: "#c0c0c0",
                    border: "2px solid",
                    borderColor: "#dfdfdf #808080 #808080 #dfdfdf",
                    boxShadow: "inset 1px 1px 0 #ffffff, inset -1px -1px 0 #000000",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontFamily: '"ABeeZee", sans-serif',
                    color: "black"
                  }}
                >
                  Sign in with Hack Club
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="messages-list" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "2rem" }}>
        {messages === undefined ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p>No messages yet. Be the first!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="message win98-window" style={{ display: "flex", flexDirection: "column", backgroundColor: "#c0c0c0", border: "2px solid", borderColor: "#dfdfdf #808080 #808080 #dfdfdf", boxShadow: "inset 1px 1px 0 #ffffff, inset -1px -1px 0 #000000" }}>
              <div className="win98-titlebar" style={{ background: "linear-gradient(90deg, #000080 0%, #1084d7 100%)", color: "white", padding: "4px 6px", fontWeight: "bold", fontFamily: '"ABeeZee", sans-serif', fontSize: "0.9rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span><strong>{msg.author || "Anonymous"}</strong> - <span>{new Date(msg._creationTime).toLocaleDateString()}</span></span>
                {isAdmin && (
                  <button
                    onClick={() => removeMessage({ messageId: msg._id })}
                    title="Delete message"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#ff6b6b",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "0.85rem",
                      padding: "0 4px",
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="message-body" style={{ padding: "1rem", backgroundColor: "#fff", color: "#000", margin: "2px", border: "2px solid", borderColor: "#808080 #dfdfdf #dfdfdf #808080", boxShadow: "inset 1px 1px 0 #000000, inset -1px -1px 0 #ffffff", fontFamily: '"ABeeZee", sans-serif', whiteSpace: "pre-wrap" }}>
                {msg.body}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
