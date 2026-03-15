import { useState } from "react";
import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";

export default function GuestbookApp() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const messages = useQuery(api.messages.list);
  const sendMessage = useMutation(api.messages.send);

  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setIsSubmitting(true);
    try {
      await sendMessage({ body });
      setBody("");
      setSubmitted(true);
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
      <div className="win98-window message-form-container">
        <div className="win98-titlebar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Sign the Guestbook</h2>
          {isAuthenticated && (
            <button
              onClick={() => signOut()}
              style={{ fontSize: "0.7rem", padding: "2px 4px", cursor: "pointer" }}
            >
              Sign Out
            </button>
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
                  Message sent! It will appear once approved.
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
              <p style={{ marginBottom: "1rem" }}>You need to sign in with GitHub to leave a message!</p>
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
              <div className="win98-titlebar" style={{ background: "linear-gradient(90deg, #000080 0%, #1084d7 100%)", color: "white", padding: "4px 6px", fontWeight: "bold", fontFamily: '"ABeeZee", sans-serif', fontSize: "0.9rem" }}>
                <strong>{msg.author || "Anonymous"}</strong> - <span>{new Date(msg._creationTime).toLocaleDateString()}</span>
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
