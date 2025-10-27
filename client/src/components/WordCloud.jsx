import React, { useEffect, useState } from "react";
import WordCloud from "react-d3-cloud";

const WordCloudChart = ({ coin, date }) => {
  const [words, setWords] = useState([]);

  useEffect(() => {
    // 🔹 測試模式：永遠讀 sample_wordcloud.json
    fetch(`/data/sample_wordcloud.json`)
      .then((res) => {
        if (!res.ok) throw new Error("無法讀取文字雲資料");
        return res.json();
      })
      .then((data) => setWords(data))
      .catch((err) => {
        console.error("讀取文字雲失敗:", err);
        setWords([]);
      });
  }, []); // 只在第一次 render 執行

  const fontSizeMapper = (word) => Math.log2(word.value) * 20 + 30;
  const rotate = () => 0;

  return (
    <div
      style={{
        marginTop: "20px",
        background: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h3 style={{ marginBottom: "16px", color: "#111827", fontSize: "18px" }}>
        ☁️ {coin} 的文字雲 (測試資料)
      </h3>
      {words.length > 0 ? (
        <WordCloud
          data={words}
          fontSizeMapper={fontSizeMapper}
          rotate={rotate}
          width={140}
          height={60}
        />
      ) : (
        <p style={{ color: "#6b7280" }}>沒有找到文字雲資料</p>
      )}
    </div>
  );
};

export default WordCloudChart;