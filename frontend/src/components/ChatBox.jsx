import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api";
import Message from "./Message";

const SUGGESTIONS = [
  "What is this video about?",
  "Summarise the key points",
  "What happens at 5:00?",
  "Who is being interviewed?",
];

export default function ChatBox({ videoUrl }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (question) => {
    const q = question || input.trim();
    if (!q || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/ask?question=${encodeURIComponent(q)}`
      );
      const data = res.data;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.answer || data.error || "Something went wrong.",
          timestamp: data.timestamp,
          all_timestamps: data.all_timestamps,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠ Could not reach the backend." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="glass rounded-xl flex flex-col fade-up-delay-1" style={{ height: "560px" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" style={{ boxShadow: "0 0 6px #22c55e" }}></div>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.7rem",
              letterSpacing: "0.12em",
              color: "var(--text-secondary)",
              textTransform: "uppercase",
            }}
          >
            Conversation
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.65rem",
              color: "var(--text-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "var(--red-accent)")}
            onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-6 fade-up">
            {/* Empty state icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: "var(--amber-glow)", border: "1px solid var(--amber-dim)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <div className="text-center">
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "6px" }}>
                Ask about the video
              </p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Try one of the suggestions below
              </p>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-lg px-3 py-1.5 transition-all"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.72rem",
                    color: "var(--text-secondary)",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--amber-dim)";
                    e.currentTarget.style.color = "var(--amber)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <Message
            key={i}
            role={msg.role}
            text={msg.text}
            timestamp={msg.timestamp}
            all_timestamps={msg.all_timestamps}
            videoUrl={videoUrl}
          />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 items-start message-slide">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "#1a1a1a",
                border: "1px solid var(--border)",
                fontFamily: "'DM Mono', monospace",
                fontSize: "0.65rem",
                color: "var(--text-secondary)",
              }}
            >
              AI
            </div>
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-1"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <span className="spinner" />
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  marginLeft: "8px",
                }}
              >
                Thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 flex gap-2"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <input
          className="input-field flex-1 rounded-lg px-4 py-2.5"
          placeholder="Ask anything about the video..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="btn-amber rounded-lg px-4 py-2.5 flex items-center gap-1.5"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}