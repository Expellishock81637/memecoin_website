const express = require('express');
const path = require('path');
const chartRoutes = require('./routes/chart');

const app = express();
const PORT = process.env.PORT || 3000;

// 靜態提供 React build 檔案
app.use(express.static(path.join(__dirname, 'client/build')));

// API 路由
app.use('/api/price', chartRoutes);

// React 前端路由 fallback
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
