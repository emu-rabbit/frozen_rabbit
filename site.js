const dialog = document.querySelector('.photo-dialog');
const preview = dialog.querySelector('img');
const caption = dialog.querySelector('p');
for (const link of document.querySelectorAll('.photo-open')) {
  link.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    preview.src = link.href;
    preview.alt = link.querySelector('img').alt;
    caption.textContent = link.dataset.caption;
    dialog.showModal();
  });
}
dialog.querySelector('.close-photo').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});

// The original HTML remains the Traditional Chinese source and no-script fallback.
// Each row contains a selector, optional attribute, then Simplified Chinese, English and Japanese.
const translations = [
  ['title', '', '冷冻兔肉的小基地｜FFXIV 工具与冒险日常', 'Frozen Rabbit’s Base | FFXIV Tools & Adventures', '冷凍うさぎの小さな拠点｜FFXIV ツールと冒険の日々'],
  ['meta[name="description"]', 'content', '欢迎来到冷冻兔肉的小基地。带上 Workshop 的备料清单、Tome 的采集秘籍和 Cosmic 的制作引导，一起在 FFXIV 冒险。', 'Welcome to Frozen Rabbit’s base. Bring Workshop’s material lists, Tome’s gathering strategies and Cosmic’s crafting guidance on your FFXIV adventures.', '冷凍うさぎの小さな拠点へようこそ。Workshop の素材リスト、Tome の採集ガイド、Cosmic の製作ガイドと一緒に FFXIV を冒険しよう。'],
  ['.skip-link', '', '跳至工具入口', 'Skip to tools', 'ツール一覧へ'],
  ['.brand', 'aria-label', '冷冻兔肉首页', 'Frozen Rabbit home', '冷凍うさぎのホーム'],
  ['.brand>span, .personal-note>.handwritten', '', '冷冻兔肉', 'Frozen Rabbit', '冷凍うさぎ'],
  ['nav', 'aria-label', '主要导航', 'Main navigation', 'メインナビゲーション'],
  ['#language', 'aria-label', '切换语言', 'Change language', '言語を切り替える'],
  ['a>.sr-only', '', '（在新标签页打开）', ' (opens in a new tab)', '（新しいタブで開きます）'],
  ['#hero-title', '', '欢迎光临，<br><span class="name-sticker">冷冻兔肉</span><br>的小基地<span class="orange">！</span>', 'Welcome to<br><span class="name-sticker">Frozen Rabbit’s</span><br>little base<span class="orange">!</span>', 'ようこそ、<br><span class="name-sticker">冷凍うさぎ</span><br>の小さな拠点へ<span class="orange">！</span>'],
  ['.hero-aside', '', '生产采集是本业，拯救世界是副业。<span aria-hidden="true">✳</span>', 'Crafter by trade, world-saver on the side.<span aria-hidden="true">✳</span>', '本業はギャザクラ、世界を救うのは副業。<span aria-hidden="true">✳</span>'],
  ['.hero-description', '', 'FFXIV 备料、采集与制作的小帮手。<br>需要什么，自己拿，别客气。', 'A little help with FFXIV materials, gathering and crafting.<br>Take what you need. Make yourself at home.', 'FFXIV の素材集め・採集・製作をお手伝い。<br>必要なものを、どうぞご自由に。'],
  ['.hero-button', '', '来，这边传送 <span aria-hidden="true">↘</span>', 'Your teleport awaits <span aria-hidden="true">↘</span>', 'こちらからテレポ <span aria-hidden="true">↘</span>'],
  ['.sunburst', '', '生产采集<br><b>出没注意</b>', 'Crafters<br><b>at play!</b>', 'ギャザクラ<br><b>出没注意</b>'],
  ['.mini-photo img', 'alt', '绿发角色在海边翻开发光的书', 'A green-haired character opens a glowing book by the sea', '海辺で光る本を開く緑髪のキャラクター'],
  ['.mini-photo figcaption', '', '有事没事，翻一下秘籍。', 'Always time for a little reading.', '暇があれば、秘伝書をぱらり。'],
  ['#sticker-title', '', '游戏原照中的绿发角色，穿着紫白外套挥手，剪成白边贴纸', 'A white-bordered sticker of a green-haired character waving in a purple and white coat, cut from a game screenshot', 'ゲーム写真から切り抜いた、紫と白のコートで手を振る緑髪のキャラクターの白縁ステッカー'],
  ['.photo-note', '', '本人比工具<br>还常在拍照。', 'More snapshots<br>than tool updates.', 'ツール作りより<br>写真ばかり撮ってます。'],
  ['#projects-title', '', '今天要去哪里<span class="orange">？</span>', 'Where to today<span class="orange">?</span>', '今日はどこへ<span class="orange">？</span>'],
  ['.toolkit .section-heading>p', '', '不用传送费，放心点。↙', 'No teleport fee. Take your pick. ↙', 'テレポ代は無料。気軽にどうぞ。↙'],
  ['.shopping-list span:first-child', '', '☑ 想做的装备', '☑ Gear to craft', '☑ 作りたい装備'],
  ['.shopping-list span:last-child', '', '☐ 我的钱包……', '☐ My poor wallet…', '☐ お財布は……'],
  ['.price-stamp', '', '备料中！', 'Stocking up!', '素材準備中！'],
  ['.workshop h3', '', '工坊 · 备料规划', 'Workshop · Material Planning', '工房 · 素材計画'],
  ['.workshop .project-description', '', '拆解配方、估算预算，把要买、要采、要做的材料整理成清单。', 'Break down recipes, estimate costs, and list what to buy, gather and craft.', 'レシピを分解して予算を見積もり、買う・採る・作る素材をリストにまとめます。'],
  ['.workshop .ticket strong', '', '前往工坊', 'Visit Workshop', '工房へ'],
  ['.book-note', '', '这一镐，要有收获。', 'Make every swing count.', 'この一振りで、収穫を。'],
  ['.tome h3', '', '秘籍 · 采集策略', 'Tome · Gathering Strategies', '秘伝書 · 採集戦略'],
  ['.tome .project-description', '', '依能力值推荐采矿、园艺与收藏品手法，也能模拟自己的技能组合。', 'Find mining, botany and collectable rotations for your stats, or simulate your own skill combinations.', 'ステータスに合った採掘・園芸・収集品のスキル回しを提案。自分のスキル構成もシミュレーションできます。'],
  ['.tome .ticket strong', '', '翻开秘籍', 'Open Tome', '秘伝書を開く'],
  ['.space-photo', 'alt', '穿白色猫耳兜帽的角色，在宇宙探索设施前自拍', 'A character in a white cat-eared hood takes a selfie at a Cosmic Exploration facility', 'コスモエクスプローラーの施設前で自撮りする、白い猫耳フードのキャラクター'],
  ['.space-caption', '', '兔肉已抵达宇宙。✓', 'Rabbit has landed. ✓', 'うさぎ、宇宙に到着。✓'],
  ['.cosmic h3', '', '宇宙 · 制作引导', 'Cosmic · Crafting Guidance', '宇宙 · 製作ガイド'],
  ['.cosmic .project-description', '', '专为宇宙探索高难度制作，依实际结果与球色，陪你判断下一招。', 'Step-by-step help for Cosmic Exploration expert crafting, choosing your next action from actual results and conditions.', 'コスモエクスプローラーの高難易度製作向け。実際の結果と状態をもとに、次の一手を一緒に考えます。'],
  ['.cosmic .ticket strong', '', '出发去宇宙', 'Go Cosmic', '宇宙へ出発'],
  ['#snapshots-title', '', '冒险的空档', 'Between adventures', '冒険の合間に'],
  ['.snapshots .section-heading>p', '', '点照片，看大张的。', 'Click a photo for a closer look.', '写真をクリックすると大きく見られます。'],
  ['.memory-friends figcaption', '', '一起看风景，也是正经事。', 'Taking in the view together counts, too.', '一緒に景色を眺めるのも、大事なこと。'],
  ['.memory-witch figcaption', '', '今天不赶进度，先拍一张。', 'No rush today. Just one more photo.', '今日は急がず、まず一枚。'],
  ['.memory-friends img', 'alt', '两位角色并肩坐着，望向远方的水晶塔', 'Two characters sit side by side, looking toward the distant Crystal Tower', '並んで座り、遠くのクリスタルタワーを眺める二人のキャラクター'],
  ['.memory-witch img', 'alt', '戴着大魔女帽的绿发角色，微笑坐在城市街道上', 'A smiling green-haired character in a large witch hat sits on a city street', '大きな魔女帽子をかぶり、街角で微笑んで座る緑髪のキャラクター'],
  ['.personal-note p', '', '希望工具用得顺手，<br>也别忘了偶尔放下清单，看看风景。', 'Hope these tools make life easier.<br>Remember to put the lists down and enjoy the view sometimes.', 'ツールが冒険の役に立ちますように。<br>ときにはリストを置いて、景色を楽しむのも忘れずに。'],
  ['.footer-small>span', '', '玩家自制・非官方 FFXIV 工具网站<br>游戏影像 © SQUARE ENIX', 'Fan-made, unofficial FFXIV tools<br>Game imagery © SQUARE ENIX', 'プレイヤー制作・非公式 FFXIV ツールサイト<br>ゲーム画像 © SQUARE ENIX'],
  ['.photo-dialog', 'aria-label', '冒险照片预览', 'Adventure photo preview', '冒険写真のプレビュー'],
  ['.close-photo', 'aria-label', '关闭照片', 'Close photo', '写真を閉じる'],
];
const localizedNodes = translations.flatMap(([selector, attribute, ...values]) =>
  [...document.querySelectorAll(selector)].map(element => ({
    element, attribute, values: [attribute ? element.getAttribute(attribute) : element.innerHTML, ...values],
  }))
);
const languageSelect = document.querySelector('#language');
const languages = ['tw', 'cn', 'en', 'ja'];
function setLanguage(language) {
  const index = languages.indexOf(language);
  if (index < 0) return;
  for (const { element, attribute, values } of localizedNodes) {
    if (attribute) element.setAttribute(attribute, values[index]);
    else element.innerHTML = values[index];
  }
  document.documentElement.lang = ['zh-Hant', 'zh-Hans', 'en', 'ja'][index];
  languageSelect.value = language;
  for (const link of document.querySelectorAll('.photo-open')) {
    link.dataset.caption = link.closest('figure').querySelector('figcaption').textContent;
  }
  if (language !== 'tw') document.querySelector('.personal-note>.handwritten').append(' ☺');
  try { localStorage.setItem('frozen-rabbit-language', language); } catch { /* Storage may be unavailable. */ }
}
let savedLanguage;
try { savedLanguage = localStorage.getItem('frozen-rabbit-language'); } catch { /* Use the default. */ }
setLanguage(languages.includes(savedLanguage) ? savedLanguage : 'tw');
languageSelect.addEventListener('change', () => setLanguage(languageSelect.value));
