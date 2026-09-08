# 冷凍兔肉 · Frozen Rabbit

冷凍兔肉的 FFXIV 工具入口：介紹 Workshop、Tome 與 Cosmic，並提供各專案的連結。

## 本機預覽

使用 Node.js 執行 `npm run dev`，開啟 http://127.0.0.1:4173。

`npm run build` 將靜態網站輸出至 `dist/`，可放至靜態網站主機。網站不需要安裝套件。`site.js` 提供照片放大預覽；停用 JavaScript 時，工具連結與原圖連結仍可使用。字型使用 Google Fonts；無法連線時使用系統字型。

`index.html` 維護介紹與連結，`style.css` 維護響應式版面。`assets/` 使用站主提供的 FFXIV 遊戲照片，以及三個專案各自設定的 favicon。首頁人物以 SVG 裁切原照、加上白色紙邊，沒有重繪角色。原始下載資料夾中的照片未修改。

素材對照：`crafter.jpg` = `messageImage_1776248815070.jpg`；`book.jpg` = `messageImage_1777446404831.jpg`；`witch.jpg` = `messageImage_1780284008122.jpg`；`friends.png` = `twitter.png`；`space.png` = `螢幕擷取畫面 2026-08-17 084158.png`。遊戲影像 © SQUARE ENIX。

## SEO 與連結預覽

目前以 `https://emu-rabbit.github.io/frozen_rabbit/` 作為正式網址，發布內容為 `dist/`。首頁介紹、三個工具的用途與連結、照片說明都直接包含在初始 HTML，無須執行 JavaScript 才能讀取。

`index.html` 維護 canonical、索引設定、Open Graph、Twitter 大圖卡片，以及 WebSite、CollectionPage、工具清單與作者的 JSON-LD。這是工具入口網站，因此首頁以 CollectionPage 描述；各工具才使用 WebApplication。`site.js` 沿用現有翻譯，同步四語的頁面標題、描述、分享欄位與工具結構化資料。爬蟲與分享平台取得的初始內容為繁體中文；目前沒有獨立語系網址，因此不宣告指向同一頁的多語 hreflang。

分享圖為 `assets/og-cover.jpg`，1200 × 630 JPEG，由 `crafter.jpg` 經內建 imagegen 處理後縮放、壓縮。原始照片未修改。處理要求為僅裁切與縮放、保留人物和背景、不新增文字；生成式處理仍可能有細節差異。

`robots.txt` 與 `sitemap.xml` 一起輸出。GitHub Pages 專案子目錄中的 robots.txt 不取代網域根目錄的 robots.txt；本站可索引設定由 HTML robots 標籤提供，sitemap 可在 Search Console 提交。若日後改成獨立網域，需一起更新 HTML 的 canonical、OG URL、圖片絕對網址、JSON-LD，以及 robots、sitemap 和驗證腳本。

`npm run build` 會自動執行 SEO 檢查，也可使用 `npm run seo:verify` 驗證既有 `dist/`。檢查涵蓋初始 HTML、描述一致性、結構化資料與可見工具介紹、素材路徑、sitemap 與 JPEG 實際尺寸。這些是本機產物檢查；發布後仍需確認公開網址回應與分享平台的快取更新。
