import { useState } from "react";
import VideoInput from "./components/VideoInput";
import ChatBox from "./components/ChatBox";

export default function App() {
  const [videoUrl, setVideoUrl] = useState(null);

  return (
    <div
      className="min-h-screen relative"
      style={{ background: "var(--bg-deep)", zIndex: 1 }}
    >
      {/* Ambient glow top */}
      <div
        style={{
          position: "fixed",
          top: "-80px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "300px",
          background: "radial-gradient(ellipse, rgba(245,158,11,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        className="relative max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6"
        style={{ zIndex: 1 }}
      >
        {/* Header */}
        <div className="fade-up">
          <div className="flex items-center gap-3 mb-1">
            {/* Logo mark */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "var(--amber)", flexShrink: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "1.6rem",
                fontWeight: 900,
                color: "var(--text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              YT Insight
            </h1>
          </div>
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.72rem",
              color: "var(--text-muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              paddingLeft: "44px",
            }}
          >
            Ask questions about any YouTube video
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "var(--border)" }} className="fade-up-delay-1" />

        {/* Video Input */}
        <VideoInput onVideoProcessed={setVideoUrl} isProcessed={!!videoUrl} />

        {/* Chat — always shown, locked until video processed */}
        <div className="relative">
          {!videoUrl && (
            <div
              className="absolute inset-0 rounded-xl flex items-center justify-center"
              style={{
                background: "rgba(10,10,10,0.7)",
                backdropFilter: "blur(4px)",
                zIndex: 10,
                border: "1px solid var(--border)",
                borderRadius: "12px",
              }}
            >
              <div className="text-center">
                <p
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Process a video first ↑
                </p>
              </div>
            </div>
          )}
          <ChatBox videoUrl={videoUrl} />
        </div>

        {/* Footer */}
        <div
          className="text-center fade-up-delay-3"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.65rem",
            color: "var(--text-muted)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Powered by Groq · FAISS · sentence-transformers
        </div>
      </div>
    </div>
  );
}