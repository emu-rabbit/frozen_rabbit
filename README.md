# 冷凍兔肉 · Frozen Rabbit

冷凍兔肉的 FFXIV 工具入口：介紹 Workshop、Tome 與 Cosmic，並提供各專案的連結。

## GitHub Pages 部署

正式網址：<https://frozenrabbit.com/>。`.github/workflows/deploy.yml` 在推送 `main` 或手動執行時建置並驗證網站，只發布 `dist/`。GitHub 儲存庫的 Settings → Pages → Source 必須選擇 **GitHub Actions**，Custom domain 設為 `frozenrabbit.com`；Actions 部署的網域設定以 Pages 設定為準，不能只依靠 CNAME 檔。

GoDaddy DNS 設定（TTL 可維持 1 小時）：

| 類型 | 名稱 | 資料 |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | emu-rabbit.github.io |

將原本 `@ → WebsiteBuilder Site` 的 A 記錄改為第一筆 GitHub IP，再新增其餘三筆；不要保留舊的網站服務 A 記錄。將既有 `www → frozenrabbit.com` 改成表中的目標，不包含協定或儲存庫路徑。保留 NS、SOA、`_domainconnect`、`_dmarc` 與其他子網域設定。

先完成 GitHub Pages 的 Custom domain，再切換 DNS。DNS 生效並且 GitHub 憑證簽發後，在 Pages 勾選 **Enforce HTTPS**。最後確認根網域首頁、www 轉址、robots.txt、sitemap.xml 與分享圖都可正常使用。DNS 傳播可能需要最多 24 小時。

官方說明：[GitHub Pages 自訂網域](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)。

## 本機預覽

先執行 `npm ci`，再使用 Node.js 執行 `npm run dev`，開啟 http://127.0.0.1:4173。

`npm run build` 將靜態網站輸出至 `dist/`，可放至靜態網站主機。建置使用 LinkeDOM 產生多語靜態頁，發布後不需要伺服器端程式。`site.js` 提供照片放大預覽；停用 JavaScript 時，工具連結與原圖連結仍可使用。字型使用 Google Fonts；無法連線時使用系統字型。

`index.html` 維護介紹與連結，`style.css` 維護響應式版面。`assets/` 使用站主提供的 FFXIV 遊戲照片，以及三個專案各自設定的 favicon。首頁人物以 SVG 裁切原照、加上白色紙邊，沒有重繪角色。原始下載資料夾中的照片未修改。

頁面圖片使用 WebP，依顯示用途縮放；首頁人物保留原解析度以維持 SVG 裁切座標與清晰度。相簿先載入 `friends-thumb.webp`、`witch-thumb.webp`，點擊後才載入原解析度的 WebP 大圖。下方圖片保留延遲載入並使用非同步解碼。網站與 Apple 圖示共用 180 × 180 PNG，分享圖保留 1200 × 630 JPEG。更新圖片時，請同步維護 HTML 的尺寸。

素材對照：`crafter.jpg` = `messageImage_1776248815070.jpg`；`book.jpg` = `messageImage_1777446404831.jpg`；`witch.jpg` = `messageImage_1780284008122.jpg`；`friends.png` = `twitter.png`；`space.png` = `螢幕擷取畫面 2026-08-17 084158.png`。遊戲影像 © SQUARE ENIX。

## SEO 與連結預覽

正式網址為 https://frozenrabbit.com/，發布內容為 `dist/`。四語網址為 `/tw/`（繁中）、`/cn/`（簡中）、`/en/`（英文）、`/ja/`（日文）。根網址保留繁中入口，canonical 指向 `/tw/`；各語系頁面有自己的 canonical、互相對應的 hreflang，以及指向根入口的 x-default。

`index.html` 維護繁中內容與共用版型，`localization.mjs` 維護其他語系翻譯；`build.mjs` 輸出各語系完整 HTML、Open Graph、Twitter 與 JSON-LD。爬蟲與分享平台無須執行 JavaScript 即可取得對應語系內容。不要直接修改 dist。

語系選單前往對應網址，保留其他查詢參數與錨點；返回、重新整理與分享都以網址語系為準，不受舊 localStorage 設定影響。頁尾提供停用 JavaScript 時也能使用的語系連結。`?lang=en` 等查詢形式可在瀏覽器轉到正式語系路徑；對外分享請使用路徑形式，讓不執行 JavaScript 的預覽服務取得正確語系。

共用分享圖為 `assets/og-base-v2.jpg`，1200 × 630 JPEG，沿用首頁紙張底色、藍色標籤、照片與 SVG 人物貼紙，沒有重新生成角色。版本化檔名避免沿用舊圖片網址。分享文字隨語系變更，圖片保留繁中品牌主視覺。

重新輸出分享圖：先執行 `node build.mjs`，再執行 `node scripts/render-og.mjs`，最後 `npm run build`。渲染使用 Playwright Chromium（可先執行 `npx playwright install chromium`），或用環境變數 `CHROMIUM_PATH` 指定本機 Chromium／Edge 執行檔。Google Fonts 可用時會等待字型載入。

`robots.txt` 一起輸出；sitemap.xml 由建置流程依四個正式語系網址產生，可在 Search Console 提交。多語設定參考 [Google Search Central](https://developers.google.com/search/docs/specialty/international/localized-versions)。

`npm run build` 自動檢查五份初始 HTML、語系、canonical／hreflang、分享欄位、結構化資料與工具介紹、素材、sitemap 與 JPEG 尺寸。先以環境變數 PORT=4186 執行 `npm run dev`，再用 `node scripts/verify-browser.mjs` 檢查語系切換、歷史返回、查詢參數、桌機／手機寬度、照片預覽與無 JavaScript 連結。這些是本機驗證；發布後仍需確認公開網址與分享平台快取。
