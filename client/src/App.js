import React, { useState } from "react";
import PriceChartPage from "./PriceChartPage";
import WordCloudChart from "./components/WordCloud"; // ✅ 直接引入 WordCloud 組件
import { FaBars, FaChartLine, FaInfoCircle, FaEnvelope, FaCloud } from "react-icons/fa";

function App() {
  const [activeTab, setActiveTab] = useState("chart");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false); // 點選後自動關閉選單
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Navbar */}
      <nav
        style={{
          background: "#2563eb",
          padding: "12px 20px",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "bold" }}>📈 迷因幣趨勢</h1>

        {/* 漢堡按鈕 */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: "26px",
            cursor: "pointer",
          }}
        >
          <FaBars />
        </button>
      </nav>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div
          style={{
            background: "#1d4ed8",
            padding: "15px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        >
          <MenuButton icon={<FaChartLine />} label="價格趨勢圖" onClick={() => handleTabClick("chart")} />
          <MenuButton icon={<FaCloud />} label="文字雲" onClick={() => handleTabClick("wordcloud")} />
          <MenuButton icon={<FaInfoCircle />} label="關於" onClick={() => handleTabClick("about")} />
          <MenuButton icon={<FaEnvelope />} label="聯絡" onClick={() => handleTabClick("contact")} />
        </div>
      )}

      {/* Tab Content */}
      <div style={{ padding: "20px", maxWidth: "1100px", margin: "0 auto" }}>
        {activeTab === "chart" && <PriceChartPage />}
        {activeTab === "wordcloud" && (
          <WordCloudChart coin="PEPE" date="2021-04-15" />
        )}
        {activeTab === "about" && (
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h2 style={{ marginBottom: "12px" }}>ℹ️ 關於本站</h2>
            <p style={{ color: "#374151", lineHeight: "1.6" }}>
              這是一個展示專題--社群發言與迷因幣價格關聯性之研究結果的網站。
              <br />
              包含價格圖表、每日推文數據、文字雲與重大事件標註。
            </p>
          </div>
        )}
        {activeTab === "contact" && (
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            }}
          >
            <h2 style={{ marginBottom: "12px" }}>📬 聯絡我們</h2>
            <p style={{ color: "#374151", lineHeight: "1.6" }}>
              如果有任何建議或問題，歡迎透過 Email 聯繫我們：
              <br />
              <a href="mailto:testing@gmail.com" style={{ color: "#2563eb", fontWeight: "bold" }}>
                testing@gmail.com
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 🔹 小按鈕元件 (避免重複)
const MenuButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: "transparent",
      border: "none",
      color: "#fff",
      fontSize: "16px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      cursor: "pointer",
      transition: "transform 0.2s, color 0.2s",
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(4px)")}
    onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(0)")}
  >
    {icon} {label}
  </button>
);

export default App;
