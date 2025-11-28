# PWA 相機應用

一個支援原生鏡頭拍照的 Progressive Web App（PWA）應用。

## 功能特性

- 📸 **原生鏡頭支援** - 使用 MediaDevices API 存取設備相機
- 📱 **PWA 支援** - 可安裝到主畫面，支援離線使用
- 🖼️ **照片管理** - 拍照、預覽、下載、刪除
- 🎨 **美觀界面** - 響應式設計，支援所有設備尺寸
- ⚡ **快速加載** - Service Worker 快取，離線功能

## 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 開發模式
```bash
npm run dev
```
應用會自動在 http://localhost:3000 開啟

### 3. 生產構建
```bash
npm run build
npm run preview
```

## 文件結構

```
.
├── index.html              # 主 HTML 檔案
├── CameraApp.jsx           # React 相機組件
├── service-worker.js       # Service Worker 快取邏輯
├── manifest.json          # PWA 清單配置
├── vite.config.js         # Vite 構建配置
├── package.json           # 依賴管理
└── public/                # 靜態資源（如果有）
```

## 主要 API 使用

### MediaDevices API
```javascript
// 取得相機串流
const stream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'user' },
  audio: false,
});
```

### Canvas API
```javascript
// 從視頻幀截圖
const context = canvas.getContext('2d');
context.drawImage(video, 0, 0);
const photoUrl = canvas.toDataURL('image/jpeg');
```

### Service Worker
- 離線快取
- 資源預快取
- 背景同步支援

## 功能說明

### 開啟相機
點擊「開啟相機」按鈕，應用會請求相機權限並顯示實時視頻。

### 拍照
當相機運行時，點擊「拍照」按鈕可以拍攝當前幀的照片。

### 照片預覽
拍照後會自動顯示照片預覽，可以選擇保存或重新拍照。

### 照片管理
- **下載** - 將照片保存到設備
- **刪除** - 從庫中刪除單張照片
- **全部刪除** - 清空所有照片

## 瀏覽器相容性

| 功能 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| MediaDevices API | ✅ | ✅ | ✅ | ✅ |
| Service Worker | ✅ | ✅ | ✅ | ✅ |
| PWA 安裝 | ✅ | ✅ | ✅ | ✅ |
| Canvas | ✅ | ✅ | ✅ | ✅ |

## 許可權要求

應用需要以下許可權：

1. **相機** - 用於拍照
   - iOS：需要在 Info.plist 中配置
   - Android：需要在 AndroidManifest.xml 中配置
   - 網頁：需要 HTTPS 和用戶授權

2. **存儲** - 用於快取和照片保存
   - Service Worker 快取
   - 本地存儲照片數據

## 開發提示

### 測試相機功能
使用 Chrome DevTools 的設備模擬器測試不同設備上的相機功能。

### 調試 Service Worker
在 Chrome DevTools → Application → Service Workers 中檢查和調試。

### 模擬離線
在 Chrome DevTools → Network → 勾選「Offline」進行離線測試。

## PWA 部署

### HTTPS 要求
PWA 需要 HTTPS（本地開發可用 localhost）。

### 部署步驟

1. 構建應用
```bash
npm run build
```

2. 將 `dist` 文件夾部署到 web 服務器

3. 確保服務器配置正確的 MIME 類型：
   - manifest.json → application/manifest+json
   - service-worker.js → application/javascript
   - *.html → text/html

4. 設置適當的快取策略

## 常見問題

### Q: 為什麼要求 HTTPS？
A: 相機和 Service Worker 等功能出於安全考慮要求 HTTPS。

### Q: 如何在 iOS 上安裝？
A: 打開應用 → 點擊分享 → 「加入主畫面」

### Q: 照片儲存位置？
A: 下載的照片存儲在設備的「下載」文件夾中。

## 許可

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

---

**建立日期**: 2025
**最後更新**: 2025
