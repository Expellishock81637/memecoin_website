import React, { useEffect, useState } from "react";

const EventsInfo = ({ date, coin }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!date) return;

    const fetchEvents = async () => {
      try {
        const res = await fetch(`/data/event/${coin}_events.json`);
        if (res.ok) {
          const data = await res.json();

          // 假設格式是 [{date, event, content, link}, ...]
          const matched = data.filter((e) => e.date.startsWith(date));
          setEvents(matched);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("事件讀取失敗:", err);
        setEvents([]);
      }
    };

    fetchEvents();
  }, [date, coin]);

  if (!date) {
    return (
      <p
        style={{
          color: "#6b7280",
          textAlign: "center",
          marginTop: "20px",
          fontSize: "15px",
        }}
      >
        📌 請點選圖表上的某一天來查看事件
      </p>
    );
  }

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        background: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
      }}
    >
      <h3
        style={{
          marginBottom: "16px",
          fontSize: "20px",
          fontWeight: "600",
          color: "#111827",
        }}
      >
        📅 {coin} - {date} 的事件
      </h3>

      {events.length > 0 ? (
        <ul style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {events.map((e, idx) => (
            <li
              key={idx}
              style={{
                padding: "16px",
                borderLeft: "4px solid #2563eb",
                background: "#f9fafb",
                borderRadius: "8px",
                listStyle: "none",
                transition: "all 0.2s",
              }}
            >
              {/* 標題 */}
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#111827",
                }}
              >
                {e.event}
              </div>

              {/* 內容 */}
              {e.content && (
                <p
                  style={{
                    marginTop: "6px",
                    fontSize: "14px",
                    color: "#374151",
                    lineHeight: "1.6",
                  }}
                >
                  {e.content}
                </p>
              )}

              {/* 連結 */}
              {e.link && (
                <a
                  href={e.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: "8px",
                    display: "inline-block",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#2563eb",
                    textDecoration: "underline",
                  }}
                >
                  🔗 查看詳情
                </a>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: "#6b7280", fontSize: "15px" }}>沒有找到相關事件</p>
      )}
    </div>
  );
};

export default EventsInfo;