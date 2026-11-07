// 片單收藏室：首頁卡片、篩選、心得頁資料帶入
// 資料來源：data/films.js 的 FILMS

const TYPE_LABELS = { movie: "電影", series: "影集", anime: "動畫" };

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// 5 顆星，支援半顆
function starsHtml(rating) {
  if (rating === null || rating === undefined) {
    return '<span class="stars stars-pending">尚未評分</span>';
  }
  let html = `<span class="stars" aria-label="${rating} 顆星（滿分 5 顆）">`;
  for (let i = 1; i <= 5; i++) {
    let cls = "star-empty";
    if (rating >= i) cls = "star-full";
    else if (rating >= i - 0.5) cls = "star-half";
    html += `<span class="star ${cls}" aria-hidden="true">★</span>`;
  }
  return html + `<span class="stars-num">${rating}</span></span>`;
}

// 哭點指數，1 到 5 滴淚
function tearsHtml(cryIndex) {
  if (!cryIndex) return "";
  let drops = "";
  for (let i = 1; i <= 5; i++) {
    drops += `<span class="tear ${i <= cryIndex ? "tear-on" : ""}" aria-hidden="true"></span>`;
  }
  return `<span class="tears" aria-label="哭點指數 ${cryIndex}（滿分 5）"><span class="tears-label">哭點指數</span>${drops}</span>`;
}

// 海報；沒有海報時用代表色漸層
function posterHtml(film, prefix) {
  if (film.poster) {
    return `<img class="poster-img" src="${prefix}${film.poster}" alt="${escapeHtml(film.title)} 海報" loading="lazy">`;
  }
  return `<div class="poster-fallback" style="--film-color:${film.color}"><span>${escapeHtml(film.title)}</span></div>`;
}

function tagsHtml(tags) {
  return tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
}

/* ---------- 首頁 ---------- */
function initHome() {
  const grid = document.getElementById("film-grid");
  if (!grid) return;

  const typeBox = document.getElementById("type-filters");
  const tagBox = document.getElementById("tag-filters");
  const emptyMsg = document.getElementById("empty-msg");
  const countEl = document.getElementById("film-count");
  let currentType = "all";
  let currentTag = "all";

  // 篩選按鈕
  const types = ["all", ...Object.keys(TYPE_LABELS).filter((t) => FILMS.some((f) => f.type === t))];
  const tags = ["all", ...new Set(FILMS.flatMap((f) => f.tags))];

  typeBox.innerHTML = types.map((t) =>
    `<button class="chip" data-type="${t}" aria-pressed="${t === "all"}">${t === "all" ? "全部" : TYPE_LABELS[t]}</button>`
  ).join("");
  tagBox.innerHTML = tags.map((t) =>
    `<button class="chip chip-tag" data-tag="${escapeHtml(t)}" aria-pressed="${t === "all"}">${t === "all" ? "所有心情" : "#" + escapeHtml(t)}</button>`
  ).join("");

  typeBox.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    currentType = btn.dataset.type;
    typeBox.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === btn));
    render();
  });
  tagBox.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    currentTag = btn.dataset.tag;
    tagBox.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", b === btn));
    render();
  });

  function render() {
    const list = FILMS.filter((f) =>
      (currentType === "all" || f.type === currentType) &&
      (currentTag === "all" || f.tags.includes(currentTag))
    );
    grid.innerHTML = list.map((f) => `
      <a class="film-card" href="reviews/${f.id}.html">
        <div class="poster">
          ${posterHtml(f, "")}
          ${f.status === "draft" ? '<span class="badge-draft">撰寫中</span>' : ""}
        </div>
        <div class="film-card-body">
          <p class="film-meta">${TYPE_LABELS[f.type]} · ${f.year}</p>
          <h3 class="film-title">${escapeHtml(f.title)}</h3>
          <p class="film-original">${escapeHtml(f.originalTitle)}</p>
          ${starsHtml(f.rating)}
          <p class="film-oneliner">${escapeHtml(f.oneLiner)}</p>
          <div class="tags">${tagsHtml(f.tags)}</div>
        </div>
      </a>`).join("");
    emptyMsg.hidden = list.length > 0;
    if (countEl) countEl.textContent = `共 ${FILMS.length} 部作品`;
  }

  render();
}

/* ---------- 心得頁 ---------- */
function initReview() {
  const id = document.body.dataset.filmId;
  if (!id) return;
  const film = FILMS.find((f) => f.id === id);
  const info = document.getElementById("film-info");
  if (!film) {
    if (info) info.innerHTML = `<p class="pending">找不到作品資料，請確認 data-film-id 與 films.js 的 id 是否一致。</p>`;
    return;
  }

  if (info) {
    info.innerHTML = `
      <div class="poster poster-large">${posterHtml(film, "../")}</div>
      <div class="review-head">
        <p class="film-meta">${TYPE_LABELS[film.type]} · ${film.year} · ${escapeHtml(film.length)}</p>
        <h1>${escapeHtml(film.title)}</h1>
        <p class="film-original">${escapeHtml(film.originalTitle)}</p>
        <div class="tags">${tagsHtml(film.tags)}</div>
        <blockquote class="oneliner">${escapeHtml(film.oneLiner)}</blockquote>
      </div>`;
  }

  const ratingBox = document.getElementById("rating-display");
  if (ratingBox) ratingBox.innerHTML = starsHtml(film.rating) + tearsHtml(film.cryIndex);

  const dateEl = document.getElementById("added-date");
  if (dateEl) dateEl.textContent = `收進片單：${film.addedDate}`;
}

initHome();
initReview();
