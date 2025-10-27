import React, { useEffect, useState } from "react";

const DailyInfo = ({ date, coin }) => {
  const [tweetCount, setTweetCount] = useState(null);
  const [error, setError] = useState(null);

  // 🗓️ 將日期格式化為 YYYY-MM-DD
  const normalizeDate = (d) => {
    if (!d) return null;
    const parsed = new Date(d);
    if (!isNaN(parsed)) {
      return parsed.toISOString().split("T")[0];
    }
    return d.trim();
  };

  useEffect(() => {
    if (!date) return;

    const fetchData = async () => {
      try {
        setError(null);
        const normDate = normalizeDate(date);

        const statsUrl = `/data/${coin}_daily_stats.json`;
        console.log("Fetching stats:", statsUrl);

        const statsRes = await fetch(statsUrl);
        if (!statsRes.ok) throw new Error(`Stats fetch failed: ${statsRes.status}`);

        const statsData = await statsRes.json();
        setTweetCount(statsData[normDate] ?? null);
      } catch (err) {
        console.error("讀取失敗:", err);
        setError(err.message);
        setTweetCount(null);
      }
    };

    fetchData();
  }, [date, coin]);

  if (!date) {
    return <p style={{ color: "#6b7280" }}>📌 請點選圖表上的某一天</p>;
  }

  return (
    <div
      style={{
        padding: "20px",
        background: "#f9fafb",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
      }}
    >
      <h3
        style={{
          marginBottom: "16px",
          color: "#111827",
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        🗓️ {coin} - {normalizeDate(date)}
      </h3>

      {error ? (
        <p style={{ color: "red" }}>❌ 資料讀取錯誤：{error}</p>
      ) : (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "15px 20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              background: "#2563eb",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "20px",
            }}
          >
            🐦
          </div>

          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                color: "#374151",
                fontSize: "16px",
                fontWeight: "500",
              }}
            >
              📊 推文數量
            </p>
            <p
              style={{
                margin: "4px 0 0 0",
                fontSize: "22px",
                fontWeight: "700",
                color: tweetCount !== null ? "#1e3a8a" : "#9ca3af",
              }}
            >
              {tweetCount !== null ? tweetCount.toLocaleString() : "無資料"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyInfo;
