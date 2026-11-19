import { useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api";

export default function VideoInput({ onVideoProcessed, isProcessed }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null | "success" | "error"
  const [message, setMessage] = useState("");

  const handleProcess = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setStatus(null);
    setMessage("");

    try {
      const res = await axios.post(
        `${API_BASE_URL}/process_video?url=${encodeURIComponent(url)}`
      );
      if (res.data.error) {
        setStatus("error");
        setMessage(res.data.error);
      } else {
        setStatus("success");
        setMessage("Video indexed. Ask anything below.");
        onVideoProcessed(url);
      }
    } catch (err) {
      setStatus("error");
      setMessage("Could not connect to backend. Is it running?");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleProcess();
  };

  // Extract video ID for thumbnail preview
  const getVideoId = (u) => {
    const match = u.match(/(?:v=|youtu\.be\/)([0-9A-Za-z_-]{11})/);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(url);

  return (
    <div className="glass rounded-xl p-5 fade-up">
      {/* Label */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            color: "var(--text-secondary)",
            textTransform: "uppercase",
          }}
        >
          YouTube URL
        </span>
      </div>

      {/* Input Row */}
      <div className="flex gap-2">
        <input
          className="input-field flex-1 rounded-lg px-4 py-2.5"
          type="text"
          placeholder="https://youtu.be/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          className="btn-amber rounded-lg px-5 py-2.5 flex items-center gap-2"
          onClick={handleProcess}
          disabled={loading || !url.trim()}
        >
          {loading ? (
            <>
              <span className="spinner" />
              <span>Processing</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Analyse</span>
            </>
          )}
        </button>
      </div>

      {/* Thumbnail preview */}
      {videoId && !status && (
        <div className="mt-3 flex items-center gap-3 fade-up">
          <img
            src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
            alt="Video thumbnail"
            className="w-20 h-12 object-cover rounded-md"
            style={{ border: "1px solid var(--border)" }}
          />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            Preview loaded
          </span>
        </div>
      )}

      {/* Status message */}
      {status && (
        <div
          className="mt-3 flex items-center gap-2 fade-up"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.75rem",
            color: status === "success" ? "var(--green-accent)" : "var(--red-accent)",
          }}
        >
          <span>{status === "success" ? "✓" : "✕"}</span>
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}