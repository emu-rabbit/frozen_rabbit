# 冷凍兔肉 · Frozen Rabbit

冷凍兔肉的 FFXIV 工具入口：介紹 Workshop、Tome 與 Cosmic，並提供各專案的連結。

## 本機預覽

使用 Node.js 執行 `npm run dev`，開啟 http://127.0.0.1:4173。

`npm run build` 將靜態網站輸出至 `dist/`，可放至靜態網站主機。網站不需要安裝套件。`site.js` 提供照片放大預覽；停用 JavaScript 時，工具連結與原圖連結仍可使用。字型使用 Google Fonts；無法連線時使用系統字型。

`index.html` 維護介紹與連結，`style.css` 維護響應式版面。`assets/` 使用站主提供的 FFXIV 遊戲照片，以及三個專案各自設定的 favicon。首頁人物以 SVG 裁切原照、加上白色紙邊，沒有重繪角色。原始下載資料夾中的照片未修改。

素材對照：`crafter.jpg` = `messageImage_1776248815070.jpg`；`book.jpg` = `messageImage_1777446404831.jpg`；`witch.jpg` = `messageImage_1780284008122.jpg`；`friends.png` = `twitter.png`；`space.png` = `螢幕擷取畫面 2026-08-17 084158.png`。遊戲影像 © SQUARE ENIX。
