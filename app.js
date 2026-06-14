const tones = ["rose", "sage", "sky", "mono"];
let currentTone = "rose";
let avatarData = "";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const inputs = {
  myName: $("#myName"),
  myAge: $("#myAge"),
  myGender: $("#myGender"),
  myType: $("#myType"),
  loverName: $("#loverName"),
  ageGap: $("#ageGap"),
  heightGap: $("#heightGap"),
  anniversary: $("#anniversary"),
  meet: $("#meet"),
  message: $("#message"),
};

const toneMap = {
  rose: ["#c9828f", "#e8c0c2", "#9aa98d", "#2f2930", "#f6ecec"],
  sage: ["#7f9b88", "#d8dfcf", "#b28e86", "#2f2930", "#eef3eb"],
  sky: ["#7896aa", "#d7e3e9", "#c48b91", "#2f2930", "#edf4f7"],
  mono: ["#6c6468", "#e5e0dc", "#8c7b80", "#2f2930", "#f2efed"],
};

const bg = new Image();
bg.src = "./assets/stationery-bg.png";

const defaults = {
  myName: "れん",
  myAge: "20↑",
  myGender: "♀",
  myType: "INFJ / 一途",
  loverName: "彼氏",
  ageGap: "+2歳",
  heightGap: "+12cm",
  anniversary: "2024.05.20",
  meet: "友達の紹介",
  message: "ゆるく惚気たり日常を残したりします。価値観が近い方と穏やかにつながりたいです。",
  relation: ["近距離"],
  account: ["惚気", "日常", "呼びタメOK"],
  ng: ["不倫", "晒し"],
};

function value(input, fallback) {
  return input.value.trim() || fallback;
}

function checkedValues(name) {
  return $$(`input[name="${name}"]:checked`).map((item) => item.value);
}

function tags(target, values, fallback) {
  const list = values.length ? values : [fallback];
  $(target).innerHTML = list.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[char]));
}

function render() {
  $("#cardMyName").textContent = value(inputs.myName, "なまえ");
  $("#cardAgeGender").textContent = `${value(inputs.myAge, "年齢")} / ${value(inputs.myGender, "性別")}`;
  $("#cardType").textContent = value(inputs.myType, "MBTI / 恋愛タイプ");
  $("#cardLoverName").textContent = value(inputs.loverName, "お相手");
  $("#cardAgeGap").textContent = value(inputs.ageGap, "年齢差");
  $("#cardHeightGap").textContent = value(inputs.heightGap, "身長差");
  $("#cardAnniversary").textContent = value(inputs.anniversary, "記念日");
  $("#cardMeet").textContent = value(inputs.meet, "出会い");
  $("#cardMessage").textContent = value(inputs.message, "ひとこと");
  tags("#relationTags", checkedValues("relation"), "未設定");
  tags("#accountTags", checkedValues("account"), "ゆるく更新");
  tags("#ngTags", checkedValues("ng"), "自衛します");
}

function setTone(tone) {
  currentTone = tone;
  const card = $("#card");
  card.className = `profile-card tone-${currentTone}`;
  document.body.className = `tone-${currentTone}`;
  $$(".tone-chip").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tone === currentTone);
  });
}

function setAvatar(src) {
  avatarData = src;
  $("#avatarPreview").innerHTML = src ? `<img src="${src}" alt="">` : "<span>恋</span>";
}

$$(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$(".tab").forEach((item) => item.classList.remove("is-active"));
    $$(".panel").forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");
    $(`#panel-${tab.dataset.panel}`).classList.add("is-active");
  });
});

Object.values(inputs).forEach((input) => {
  input.addEventListener("input", render);
});

$$("input[type='checkbox']").forEach((input) => {
  input.addEventListener("change", render);
});

$("#avatar").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => setAvatar(reader.result));
  reader.readAsDataURL(file);
});

$$(".tone-chip").forEach((button) => {
  button.addEventListener("click", () => setTone(button.dataset.tone));
});

$("#clear").addEventListener("click", () => {
  Object.entries(defaults).forEach(([key, val]) => {
    if (inputs[key]) inputs[key].value = val;
  });
  ["relation", "account", "ng"].forEach((name) => {
    $$(`input[name="${name}"]`).forEach((input) => {
      input.checked = defaults[name].includes(input.value);
    });
  });
  $("#avatar").value = "";
  setAvatar("");
  setTone("rose");
  render();
});

$("#download").addEventListener("click", async () => {
  await exportCard();
});

async function exportCard() {
  await ensureImage(bg);
  const canvas = $("#canvas");
  const ctx = canvas.getContext("2d");
  const [accent, accent2, accent3, ink, page] = toneMap[currentTone];
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  roundRect(ctx, 0, 0, w, h, 34, page);
  ctx.globalAlpha = .28;
  coverImage(ctx, bg, 0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.fillStyle = "rgba(255, 252, 250, .62)";
  ctx.fillRect(0, 0, w, h);

  drawNotebookLines(ctx, 86, 104, w - 172, h - 208, accent);
  roundRect(ctx, 58, 58, w - 116, h - 116, 28, "rgba(255,255,255,.82)");
  ctx.strokeStyle = "rgba(255,255,255,.92)";
  ctx.lineWidth = 4;
  roundedPath(ctx, 58, 58, w - 116, h - 116, 28);
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = "800 32px sans-serif";
  ctx.fillText("REN-AKA PROFILE", 110, 135);
  ctx.fillStyle = ink;
  fitText(ctx, value(inputs.myName, "なまえ"), 110, 226, 550, 96, 58, "800");
  ctx.fillStyle = "#8c7b80";
  ctx.font = "800 30px sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(value(inputs.anniversary, "記念日"), w - 110, 148);
  ctx.textAlign = "left";

  await drawAvatar(ctx, 110, 292, 260, accent, accent2);
  infoLine(ctx, 420, 340, "age / gender", `${value(inputs.myAge, "年齢")} / ${value(inputs.myGender, "性別")}`, ink);
  infoLine(ctx, 420, 462, "type", value(inputs.myType, "MBTI / 恋愛タイプ"), ink);

  sectionTitle(ctx, "ふたりのこと", 110, 645, accent);
  box(ctx, 110, 675, 230, 118, "お相手", value(inputs.loverName, "お相手"), ink);
  box(ctx, 365, 675, 230, 118, "年齢差", value(inputs.ageGap, "年齢差"), ink);
  box(ctx, 620, 675, 230, 118, "身長差", value(inputs.heightGap, "身長差"), ink);
  box(ctx, 875, 675, 215, 118, "出会い", value(inputs.meet, "出会い"), ink);

  drawTagSection(ctx, "ステータス", checkedValues("relation"), "未設定", 110, 885, accent, ink);
  drawTagSection(ctx, "アカウント", checkedValues("account"), "ゆるく更新", 110, 1080, accent3, ink);
  drawTagSection(ctx, "NG", checkedValues("ng"), "自衛します", 110, 1275, accent2, "#7b4850");

  roundRect(ctx, 110, 1412, 980, 112, 22, "rgba(255,255,255,.70)");
  ctx.fillStyle = ink;
  ctx.font = "31px sans-serif";
  wrapText(ctx, value(inputs.message, "ひとこと"), 138, 1460, 925, 44, 2);

  const link = document.createElement("a");
  link.download = "renai-profile-card.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function drawNotebookLines(ctx, x, y, width, height, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = .15;
  ctx.lineWidth = 2;
  for (let lineY = y; lineY < y + height; lineY += 44) {
    ctx.beginPath();
    ctx.moveTo(x, lineY);
    ctx.lineTo(x + width, lineY);
    ctx.stroke();
  }
  ctx.restore();
}

async function drawAvatar(ctx, x, y, size, accent, accent2) {
  roundRect(ctx, x, y, size, size, 22, "#ffffff");
  if (avatarData) {
    const img = await loadImage(avatarData);
    ctx.save();
    clipRound(ctx, x + 14, y + 14, size - 28, size - 28, 18);
    coverImage(ctx, img, x + 14, y + 14, size - 28, size - 28);
    ctx.restore();
    return;
  }
  const grad = ctx.createLinearGradient(x, y, x + size, y + size);
  grad.addColorStop(0, accent);
  grad.addColorStop(1, accent2);
  roundRect(ctx, x + 14, y + 14, size - 28, size - 28, 18, grad);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "900 88px sans-serif";
  ctx.fillText("恋", x + size / 2, y + size / 2 + 31);
  ctx.textAlign = "left";
}

function infoLine(ctx, x, y, label, text, ink) {
  ctx.fillStyle = "#8c7b80";
  ctx.font = "800 28px sans-serif";
  ctx.fillText(label, x, y);
  ctx.fillStyle = ink;
  fitText(ctx, text, x, y + 55, 620, 42, 28, "800");
}

function sectionTitle(ctx, text, x, y, color) {
  ctx.fillStyle = color;
  ctx.font = "800 32px sans-serif";
  ctx.fillText(text, x, y);
}

function box(ctx, x, y, width, height, label, text, ink) {
  roundRect(ctx, x, y, width, height, 18, "rgba(255,255,255,.68)");
  ctx.fillStyle = "#8c7b80";
  ctx.font = "800 24px sans-serif";
  ctx.fillText(label, x + 20, y + 40);
  ctx.fillStyle = ink;
  fitText(ctx, text, x + 20, y + 84, width - 40, 30, 22, "800");
}

function drawTagSection(ctx, title, values, fallback, x, y, color, ink) {
  sectionTitle(ctx, title, x, y, color);
  let cursorX = x;
  let cursorY = y + 35;
  const list = values.length ? values : [fallback];
  list.forEach((text) => {
    ctx.font = "800 27px sans-serif";
    const width = Math.min(ctx.measureText(text).width + 54, 270);
    if (cursorX + width > 1090) {
      cursorX = x;
      cursorY += 58;
    }
    pill(ctx, cursorX, cursorY, width, 44, "rgba(255,255,255,.68)");
    ctx.fillStyle = ink;
    ctx.fillText(text, cursorX + 27, cursorY + 31);
    cursorX += width + 14;
  });
}

function fitText(ctx, text, x, y, maxWidth, startSize, minSize, weight) {
  let size = startSize;
  do {
    ctx.font = `${weight} ${size}px sans-serif`;
    size -= 2;
  } while (ctx.measureText(text).width > maxWidth && size > minSize);
  ctx.fillText(text, x, y);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  let line = "";
  let lines = 0;
  for (const char of [...text]) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = char;
      y += lineHeight;
      lines += 1;
      if (lines >= maxLines - 1) break;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}

function pill(ctx, x, y, width, height, fill) {
  roundRect(ctx, x, y, width, height, height / 2, fill);
}

function roundRect(ctx, x, y, width, height, radius, fill) {
  roundedPath(ctx, x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
}

function clipRound(ctx, x, y, width, height, radius) {
  roundedPath(ctx, x, y, width, height, radius);
  ctx.clip();
}

function roundedPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function coverImage(ctx, img, x, y, width, height) {
  const scale = Math.max(width / img.width, height / img.height);
  const sw = width / scale;
  const sh = height / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, width, height);
}

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = src;
  });
}

function ensureImage(img) {
  if (img.complete && img.naturalWidth) return Promise.resolve();
  return new Promise((resolve) => {
    img.addEventListener("load", resolve, { once: true });
    img.addEventListener("error", resolve, { once: true });
  });
}

setTone("rose");
render();
