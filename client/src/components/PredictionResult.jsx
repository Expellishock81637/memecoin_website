import React, { useEffect, useState } from "react";

const MODELS = [
  { key: "rf", file: "rf_result.txt", name: "隨機森林 (RF)" },
  { key: "logreg", file: "logreg_result.txt", name: "邏輯迴歸 (LogReg)" },
];

// 🔹 emoji 對應中文
const symbolToText = (symbol) => {
  switch (symbol) {
    case "🟢":
      return "大漲";
    case "🟡":
      return "小漲";
    case "⚪":
      return "持平";
    case "🟠":
      return "小跌";
    case "🔴":
      return "大跌";
    default:
      return symbol;
  }
};

// 🔹 解析每一行資料格式
const parseLine = (line) => {
  if (!line || line.startsWith("===")) return null;
  const match = line.match(
    /(\d{4}-\d{2}-\d{2}).*預測:\s*([\u{1F7E2}\u{1F7E1}\u{26AA}\u{1F7E0}\u{1F534}]).*真實:\s*([\u{1F7E2}\u{1F7E1}\u{26AA}\u{1F7E0}\u{1F534}]).*結果:\s*(✅|❌)/u
  );
  if (!match) return line;
  const [, date, pred, actual, result] = match;
  return {
    date,
    predSymbol: pred,
    predText: symbolToText(pred),
    actualSymbol: actual,
    actualText: symbolToText(actual),
    result,
  };
};

const PredictionResult = ({ date, coin }) => {
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!date || !coin) return;

    const fetchData = async () => {
      try {
        setError(null);
        const newResults = {};

        for (let model of MODELS) {
          try {
            const res = await fetch(`/data/${model.file}`);
            if (!res.ok) throw new Error(`${model.file} 載入失敗`);
            const text = await res.text();

            const lines = text
              .split("\n")
              .map((line) => line.trim())
              .filter((line) => line && !line.startsWith("==="));

            const foundLine = lines.find((line) => line.startsWith(date));
            const parsed = parseLine(foundLine);
            newResults[model.key] = parsed || "❌ 沒有找到當天結果";
          } catch (err) {
            newResults[model.key] = { error: err.message };
          }
        }

        setResults(newResults);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchData();
  }, [date, coin]);

  if (!date) {
    return <p style={{ color: "#6b7280" }}>📌 請先點選圖表日期</p>;
  }

  return (
    <div
      style={{
        marginTop: "24px",
        background: "#ffffff",
        padding: "20px 24px",
        borderRadius: "14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
      }}
    >
      <h3
        style={{
          marginBottom: "16px",
          color: "#111827",
          fontSize: "19px",
          fontWeight: "600",
        }}
      >
        📑 {coin} - {date} 預測結果比較
      </h3>

      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {Object.entries(results).map(([key, data]) => {
          const model = MODELS.find((m) => m.key === key);
          if (!data) return null;

          // ⚠️ 錯誤資料
          if (typeof data === "object" && data.error) {
            return (
              <div
                key={key}
                style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                }}
              >
                ⚠️ {model.name}：{data.error}
              </div>
            );
          }

          // ❌ 找不到資料
          if (typeof data === "string") {
            return (
              <div
                key={key}
                style={{
                  padding: "14px 16px",
                  borderRadius: "10px",
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  color: "#374151",
                }}
              >
                {model.name}：{data}
              </div>
            );
          }

          // ✅ 正常結果 — 美化成資訊卡
          return (
            <div
              key={key}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "16px 20px",
                borderRadius: "12px",
                background: "#f9fafb",
                borderLeft:
                  data.result === "✅"
                    ? "5px solid #16a34a"
                    : "5px solid #dc2626",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                transition: "transform 0.15s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <span style={{ fontWeight: "600", color: "#111827" }}>
                  {model.name}
                </span>
                <span
                  style={{
                    color: data.result === "✅" ? "#16a34a" : "#dc2626",
                    fontWeight: "700",
                  }}
                >
                  {data.result === "✅" ? "✅ 正確" : "❌ 錯誤"}
                </span>
              </div>

              <div style={{ lineHeight: "1.8", fontSize: "15px" }}>
                <p style={{ margin: 0 }}>
                  🧠 <b>預測</b>：{data.predSymbol} {data.predText}
                </p>
                <p style={{ margin: 0 }}>
                  📈 <b>真實</b>：{data.actualSymbol} {data.actualText}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PredictionResult;
