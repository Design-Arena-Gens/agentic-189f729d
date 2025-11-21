/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

type Trend = {
  title: string;
  query: string;
  relatedHashtags: string[];
  source: "google-trends" | "instagram";
};

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [selected, setSelected] = useState<Trend | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [bg, setBg] = useState<"gradient" | "solid" | "pattern">("gradient");
  const memeRef = useRef<HTMLDivElement | null>(null);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/trends", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed: ${res.status}`);
        const data = (await res.json()) as { trends: Trend[] };
        setTrends(data.trends);
        if (data.trends.length > 0) {
          setSelected(data.trends[0]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleGenerate = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trend: selected
        })
      });
      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      setTopText(data.topText);
      setBottomText(data.bottomText);
      setGenerated(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!memeRef.current) return;
    const dataUrl = await toPng(memeRef.current, { cacheBust: true, pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = `${selected?.query.replace(/\s+/g, "_")}_meme.png`;
    link.href = dataUrl;
    link.click();
  };

  const bgStyle = useMemo<React.CSSProperties>(() => {
    if (bg === "solid") return { background: "#111827" };
    if (bg === "pattern")
      return {
        backgroundColor: "#0f172a",
        backgroundImage:
          "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.06) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255,255,255,0.06) 2%, transparent 0%)",
        backgroundSize: "100px 100px"
      };
    // gradient
    return {
      background: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)"
    };
  }, [bg]);

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto", color: "#111827" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>IG Trend Meme Agent</h1>
      <p style={{ color: "#4b5563", marginBottom: 24 }}>
        Daily viral trend discovery with auto meme generation. Download and post.
      </p>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          alignItems: "start"
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 12
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Trends</h2>
            {loading && <span style={{ fontSize: 12, color: "#6b7280" }}>loading?</span>}
          </div>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              overflow: "hidden"
            }}
          >
            <ul style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: 360, overflowY: "auto" }}>
              {trends.map((t, idx) => (
                <li
                  key={`${t.query}-${idx}`}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    background: selected?.query === t.query ? "#eef2ff" : "white",
                    borderBottom: "1px solid #f3f4f6"
                  }}
                  onClick={() => {
                    setSelected(t);
                    setGenerated(false);
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.title}</div>
                      <div style={{ fontSize: 12, color: "#6b7280" }}>{t.query}</div>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#374151",
                        background: "#f3f4f6",
                        padding: "2px 6px",
                        borderRadius: 999
                      }}
                    >
                      {t.source}
                    </span>
                  </div>
                  {t.relatedHashtags.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {t.relatedHashtags.slice(0, 4).map((h) => (
                        <span
                          key={h}
                          style={{
                            fontSize: 11,
                            color: "#1f2937",
                            background: "#f9fafb",
                            padding: "2px 6px",
                            borderRadius: 6
                          }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
              {trends.length === 0 && !loading && (
                <li style={{ padding: 12, fontSize: 14, color: "#6b7280" }}>No trends available.</li>
              )}
            </ul>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <button
              onClick={handleGenerate}
              disabled={!selected || loading}
              style={{
                background: "#4f46e5",
                color: "white",
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                opacity: !selected || loading ? 0.7 : 1
              }}
            >
              Generate Meme
            </button>
            <select
              value={bg}
              onChange={(e) => setBg(e.target.value as any)}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: "8px 10px",
                background: "white"
              }}
            >
              <option value="gradient">Gradient</option>
              <option value="solid">Solid</option>
              <option value="pattern">Pattern</option>
            </select>
            <button
              onClick={downloadImage}
              disabled={!generated}
              style={{
                background: "#111827",
                color: "white",
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                opacity: !generated ? 0.6 : 1
              }}
            >
              Download PNG
            </button>
          </div>

          {selected && (
            <div style={{ marginTop: 16, fontSize: 13, color: "#6b7280" }}>
              Suggested hashtags:{" "}
              {selected.relatedHashtags.slice(0, 6).map((h, i) => (
                <span key={h}>
                  <span style={{ color: "#111827" }}>{h}</span>
                  {i < Math.min(5, selected.relatedHashtags.length - 1) ? ", " : ""}
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 12 }}>Meme</h2>
          <div
            ref={memeRef}
            style={{
              width: 800,
              height: 800,
              borderRadius: 16,
              position: "relative",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...bgStyle
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div
                style={{
                  color: "white",
                  textAlign: "center",
                  textTransform: "uppercase",
                  fontWeight: 900,
                  letterSpacing: 1,
                  textShadow: "0 2px 4px rgba(0,0,0,0.4)",
                  WebkitTextStroke: "1px rgba(0,0,0,0.5)",
                  fontSize: 48,
                  lineHeight: 1.1
                }}
              >
                {topText || "When the trend hits your feed"}
              </div>
              <div />
              <div
                style={{
                  color: "white",
                  textAlign: "center",
                  textTransform: "uppercase",
                  fontWeight: 900,
                  letterSpacing: 1,
                  textShadow: "0 2px 4px rgba(0,0,0,0.4)",
                  WebkitTextStroke: "1px rgba(0,0,0,0.5)",
                  fontSize: 48,
                  lineHeight: 1.1
                }}
              >
                {bottomText || (selected ? `But you're already on ${selected.query}` : "But you're already late")}
              </div>
            </div>

            <div
              style={{
                position: "absolute",
                right: 16,
                bottom: 16,
                color: "rgba(255,255,255,0.9)",
                fontWeight: 700,
                fontSize: 16,
                textShadow: "0 1px 2px rgba(0,0,0,0.5)"
              }}
            >
              @agentic-memes
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

