import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
import Papa from "papaparse";
import DailyInfo from "./components/DailyInfo";
import EventsInfo from "./components/EventsInfo";
import WordCloudChart from "./components/WordCloud";
import PredictionResult from "./components/PredictionResult";
import zoomPlugin from "chartjs-plugin-zoom";

Chart.register(zoomPlugin);

const PriceChartPage = () => {
  const [coin, setCoin] = useState("PEPE");
  const [selectedDate, setSelectedDate] = useState(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const infoRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // === 讀價格 CSV ===
        const res = await fetch(`/data/${coin}_price.csv`);
        const csvText = await res.text();
        const parsed = Papa.parse(csvText, { header: true });
        const priceData = parsed.data.filter((row) => row.date && row.price);

        if (priceData.length === 0) {
          alert(`找不到 ${coin} 的價格資料`);
          return;
        }

        const labels = priceData.map((item) => item.date.split(" ")[0]);
        const prices = priceData.map((item) => parseFloat(item.price));

        // === 讀推文數量 JSON ===
        let tweetCounts = null;
        try {
          const tweetRes = await fetch(`/data/${coin}_daily_stats.json`);
          if (tweetRes.ok) {
            const tweetData = await tweetRes.json();
            tweetCounts = labels.map((date) => tweetData[date] || 0);
          }
        } catch (e) {
          console.warn(`${coin} 沒有 daily_stats JSON，僅顯示價格`);
        }

        // === 讀事件 JSON ===
        let eventPoints = [];
        try {
          const eventRes = await fetch(`/data/event/${coin}_events.json`);
          if (eventRes.ok) {
            const eventData = await eventRes.json();
            eventPoints = eventData.map((e) => ({
              date: e.date,
              event: e.event,
              x: e.date,
              y: Math.max(...prices) * 1.02,
            }));
          }
        } catch (err) {
          console.warn(`${coin} 沒有事件 JSON`);
        }

        // === 清除舊圖 ===
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext("2d");
        // ✅ 修正 Chart.js 攔截事件，恢復側邊欄（Tab Bar）點擊功能
        const canvas = chartRef.current;
        canvas.style.pointerEvents = "auto";
        canvas.style.touchAction = "auto";

        // === 資料集 ===
        const datasets = [
          {
            type: "line",
            label: `${coin} 價格走勢`,
            data: prices,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37, 99, 235, 0.15)",
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 5,
            borderWidth: 2,
            tension: 0.25,
            yAxisID: "yPrice",
          },
        ];

        if (tweetCounts) {
          datasets.push({
            type: "bar",
            label: "推文數量",
            data: tweetCounts,
            backgroundColor: "rgba(234, 88, 12, 0.6)",
            borderRadius: 4,
            yAxisID: "yTweets",
          });
        }

        // === 星星 Plugin ===
        const starPlugin = {
          id: "starPlugin",
          afterDatasetsDraw: (chart) => {
            const ctx = chart.ctx;
            ctx.save();
            ctx.fillStyle = "gold";
            ctx.font = "16px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            eventPoints.forEach((pt) => {
              const x = chart.scales.x.getPixelForValue(pt.x);
              const y = chart.scales.yPrice.getPixelForValue(pt.y);
              ctx.fillText("⭐", x, y);
            });

            ctx.restore();
          },
          afterEvent: (chart, args) => {
            const { event } = args;
            const ctx = chart.ctx;
            let hovered = false;

            eventPoints.forEach((pt) => {
              const x = chart.scales.x.getPixelForValue(pt.x);
              const y = chart.scales.yPrice.getPixelForValue(pt.y);
              const dx = event.x - x;
              const dy = event.y - y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              // 滑鼠在星星上時
              if (dist < 10) {
                hovered = true;

                // 顯示浮動提示
                if (event.type === "mousemove") {
                  const tooltipText = `${pt.date}\n${pt.event || "重大事件"}`;
                  const lines = tooltipText.split("\n");

                  const tooltipWidth = 180;
                  const tooltipHeight = 40 + 14 * (lines.length - 1);

                  ctx.save();
                  ctx.fillStyle = "rgba(0,0,0,0.8)";
                  ctx.fillRect(event.x + 12, event.y - 30, tooltipWidth, tooltipHeight);
                  ctx.fillStyle = "#fff";
                  ctx.font = "12px sans-serif";
                  lines.forEach((line, i) => {
                    ctx.fillText(line, event.x + 20, event.y - 12 + i * 14);
                  });
                  ctx.restore();
                }

                // 點擊星星
                if (event.type === "click") {
                  setSelectedDate(pt.date);
                  setTimeout(() => {
                    infoRef.current?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }
              }
            });

            // 更新游標樣式
            const canvas = chart.canvas;
            canvas.style.cursor = hovered ? "pointer" : "default";
          },
        };

        // === 建立新圖表 ===
        chartInstanceRef.current = new Chart(ctx, {
          data: { labels, datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "nearest", intersect: false },
            plugins: {
              legend: { position: "top" },
              tooltip: {
                filter: (tooltipItem) => {
                  // 只顯示價格與推文 tooltip，不顯示事件點
                  return tooltipItem.dataset.type !== "event";
                },
                callbacks: {
                  label: (context) => {
                    if (context.dataset.type === "line") {
                      return `價格: ${Number(context.raw.toPrecision(8))}`;
                    } else if (context.dataset.type === "bar") {
                      return `推文數量: ${context.raw}`;
                    }
                    return null;
                  },
                },
              },
              zoom: {
                limits: { x: { min: 0, max: labels.length - 1 }, y: { min: 0 } },
                pan: { enabled: true, mode: "x" },
                zoom: {
                  wheel: { enabled: true },
                  pinch: { enabled: true },
                  mode: "x",
                  drag: false,
                  limits: { x: { minRange: 5 } },
                },
              },
            },
            scales: {
              x: {
                title: { display: true, text: "日期", font: { size: 14 } },
                ticks: { maxRotation: 45, minRotation: 45 },
              },
              yPrice: {
                type: "linear",
                position: "left",
                title: { display: true, text: "價格" },
                ticks: { callback: (val) => Number(val.toPrecision(6)) },
              },
              yTweets: tweetCounts
                ? {
                    type: "linear",
                    position: "right",
                    title: { display: true, text: "推文數量" },
                    grid: { drawOnChartArea: false },
                  }
                : undefined,
            },
            onClick: (evt, elements) => {
              if (elements.length > 0) {
                const idx = elements[0].index;
                const date = labels[idx];
                setSelectedDate(date);
                setTimeout(() => {
                  infoRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }
            },
          },
          plugins: [starPlugin],
        });
      } catch (err) {
        console.error("讀取失敗:", err);
      }
    };

    loadData();
  }, [coin]);

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "20px auto",
        background: "#ffffff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: "12px", fontSize: "20px", color: "#111827" }}>
        幣種價格與社群推文數量
      </h2>

      <label htmlFor="coin-select">選擇幣種：</label>
      <select
        id="coin-select"
        value={coin}
        onChange={(e) => setCoin(e.target.value)}
        style={{ marginLeft: "10px", padding: "4px 8px", borderRadius: "6px" }}
      >
        <option value="PEPE">PEPE</option>
        <option value="DOGE">DOGE</option>
        <option value="TRUMP">TRUMP</option>
      </select>

      <div style={{ marginTop: "20px", height: "400px" }}>
        <canvas ref={chartRef}></canvas>
      </div>

      <div ref={infoRef} style={{ marginTop: "40px" }}>
        <DailyInfo date={selectedDate} coin={coin} />

        {selectedDate && (
          <>
            <WordCloudChart date={selectedDate} coin={coin} />
            <EventsInfo date={selectedDate} coin={coin} />
            <PredictionResult date={selectedDate} coin={coin} />
          </>
        )}
      </div>
    </div>
  );
};

export default PriceChartPage;
