export default function Message({ role, text, timestamp, all_timestamps, videoUrl }) {
  const isUser = role === "user";

  // Build YouTube timestamp link
  const makeTimestampLink = (ts, url) => {
    if (!url || !ts) return null;
    const [min, sec] = ts.split(":").map(Number);
    const totalSecs = min * 60 + (sec || 0);
    const videoId = url.match(/(?:v=|youtu\.be\/)([0-9A-Za-z_-]{11})/)?.[1];
    if (!videoId) return null;
    return `https://www.youtube.com/watch?v=${videoId}&t=${totalSecs}s`;
  };

  return (
    <div
      className={`message-slide flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{
          background: isUser ? "var(--amber-glow)" : "#1a1a1a",
          border: `1px solid ${isUser ? "var(--amber-dim)" : "var(--border)"}`,
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.65rem",
          color: isUser ? "var(--amber)" : "var(--text-secondary)",
        }}
      >
        {isUser ? "you" : "AI"}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] flex flex-col gap-1.5 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className="rounded-xl px-4 py-3"
          style={{
            background: isUser ? "var(--amber-glow)" : "var(--bg-card)",
            border: `1px solid ${isUser ? "var(--amber-dim)" : "var(--border)"}`,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.875rem",
            lineHeight: "1.6",
            color: "var(--text-primary)",
          }}
        >
          {text}
        </div>

        {/* Timestamps */}
        {!isUser && timestamp && (
          <div className="flex flex-wrap gap-1.5 px-1">
            {all_timestamps?.map((ts, i) => {
              const link = makeTimestampLink(ts, videoUrl);
              return link ? (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ts-badge hover:opacity-80 transition-opacity"
                  title="Jump to this moment in the video"
                >
                  ▶ {ts}
                </a>
              ) : (
                <span key={i} className="ts-badge">{ts}</span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}