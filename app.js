const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let currentTone = "rose";
let avatarData = "";
let avatarY = "50";

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
  avatarY: $("#avatarY"),
};

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

const themes = {
  rose: { page:"#fff1f6", card:"#fff8fb", accent:"#e85f94", line:"#f4b8cf", soft:"#ffe3ed", ink:"#56384a", muted:"#7f6574" },
  cream: { page:"#f8f1df", card:"#fffaf0", accent:"#b79348", line:"#dfc27c", soft:"#f2dfb4", ink:"#493a25", muted:"#7a6b4c" },
  mint: { page:"#eef7f1", card:"#fbfffc", accent:"#639c78", line:"#add0bb", soft:"#dff0e5", ink:"#304536", muted:"#607465" },
  sky: { page:"#eef7fc", card:"#f8fcff", accent:"#5f97bd", line:"#abd1eb", soft:"#dff0fb", ink:"#304250", muted:"#637683" },
  mono: { page:"#f2efed", card:"#fbfaf8", accent:"#6d6668", line:"#cbc4c1", soft:"#e7e2df", ink:"#343033", muted:"#70686b" },
};

function clean(input, fallback) {
  return input.value.trim() || fallback;
}

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  }[char]));
}

function checkedValues(name) {
  return $$(`input[name="${name}"]:checked`).map((item) => item.value);
}

function renderTags(target, values, fallback) {
  const list = values.length ? values : [fallback];
  $(target).innerHTML = list.map((item) => `<span>${escapeHtml(item)}</span>`).join("");
}

function render() {
  $("#cardMyName").textContent = clean(inputs.myName, "なまえ");
  $("#cardAgeGender").textContent = `${clean(inputs.myAge, "年齢")} / ${clean(inputs.myGender, "性別")}`;
  $("#cardType").textContent = clean(inputs.myType, "MBTI / 恋愛タイプ");
  $("#cardLoverName").textContent = clean(inputs.loverName, "お相手");
  $("#cardAgeGap").textContent = clean(inputs.ageGap, "年齢差");
  $("#cardHeightGap").textContent = clean(inputs.heightGap, "身長差");
  $("#cardAnniversary").textContent = clean(inputs.anniversary, "記念日");
  $("#cardMeet").textContent = clean(inputs.meet, "出会い");
  $("#cardMessage").textContent = clean(inputs.message, "ひとこと");
  renderTags("#relationTags", checkedValues("relation"), "未設定");
  renderTags("#accountTags", checkedValues("account"), "ゆるく更新");
  renderTags("#ngTags", checkedValues("ng"), "自衛します");
}

function setTone(tone) {
  currentTone = tone;
  document.body.className = `tone-${tone}`;
  $$(".tone-chip").forEach((button) => button.classList.toggle("is-active", button.dataset.tone === tone));
}

function setAvatar(src) {
  avatarData = src;
  $("#avatarPreview").innerHTML = src ? `<img src="${src}" alt="" style="object-position:center ${avatarY}%">` : "<span>恋</span>";
}

function resetForm() {
  Object.entries(defaults).forEach(([key, value]) => {
    if (inputs[key]) inputs[key].value = value;
  });
  ["relation", "account", "ng"].forEach((name) => {
    $$(`input[name="${name}"]`).forEach((input) => {
      input.checked = defaults[name].includes(input.value);
    });
  });
  avatarY = "50";
  inputs.avatarY.value = avatarY;
  $("#avatar").value = "";
  setAvatar("");
  setTone("rose");
  render();
}

$$(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    $$(".tab").forEach((item) => item.classList.remove("is-active"));
    $$(".panel").forEach((item) => item.classList.remove("is-active"));
    tab.classList.add("is-active");
    $(`#panel-${tab.dataset.panel}`).classList.add("is-active");
  });
});

Object.values(inputs).forEach((input) => input.addEventListener("input", render));
$$("input[type='checkbox']").forEach((input) => input.addEventListener("change", render));
$$(".tone-chip").forEach((button) => button.addEventListener("click", () => setTone(button.dataset.tone)));

$("#avatar").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => setAvatar(reader.result));
  reader.readAsDataURL(file);
});

$("#avatarY").addEventListener("input", (event) => {
  avatarY = event.target.value;
  const img = $("#avatarPreview img");
  if (img) img.style.objectPosition = `center ${avatarY}%`;
});

$("#clear").addEventListener("click", resetForm);
$("#save").addEventListener("click", saveImage);
$("#closeSheet").addEventListener("click", () => { $("#resultSheet").hidden = true; });

async function saveImage() {
  const blob = await makePngBlob();
  const file = new File([blob], "renai-profile-card.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "恋垢プロフィール帳" });
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }
  showSaveSheet(blob);
}

function showSaveSheet(blob) {
  const url = URL.createObjectURL(blob);
  const image = $("#resultImage");
  const link = $("#downloadLink");
  if (image.dataset.url) URL.revokeObjectURL(image.dataset.url);
  image.dataset.url = url;
  image.src = url;
  link.href = url;
  $("#resultSheet").hidden = false;
}

function makePngBlob() {
  const canvas = $("#canvas");
  drawCard(canvas);
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

function drawCard(canvas) {
  const ctx = canvas.getContext("2d");
  const t = themes[currentTone];
  ctx.clearRect(0, 0, 1600, 900);
  ctx.fillStyle = t.card;
  ctx.fillRect(0, 0, 1600, 900);
  blob(ctx, 130, 126, 155, t.soft);
  blob(ctx, 1460, 760, 170, t.soft);
  ctx.fillStyle = t.accent;
  ctx.globalAlpha = .45;
  ctx.font = "900 78px sans-serif";
  ctx.fillText("♡", 54, 92);
  ctx.fillText("✦", 1450, 112);
  ctx.fillText("✧", 86, 820);
  ctx.fillText("♡", 1470, 824);
  ctx.globalAlpha = 1;
  panel(ctx, 34, 34, 1532, 832, 34, "rgba(255,255,255,.78)", t.accent, 7);
  dashedPanel(ctx, 62, 62, 1476, 776, 24, t.line);
  dottedLine(ctx, 100, 160, 1500, 160, t.line);
  dottedLine(ctx, 100, 812, 1500, 812, t.line);
  pill(ctx, 622, 66, 356, 50, t.soft);
  ctx.fillStyle = t.accent;
  ctx.font = "900 26px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("✦ koikatsu profile ✦", 800, 101);
  ctx.fillStyle = t.ink;
  ctx.font = "900 52px sans-serif";
  ctx.fillText("恋垢プロフィール帳", 800, 150);
  ctx.textAlign = "left";

  photoBox(ctx, 72, 180, 330, 365, t);
  field(ctx, 72, 565, 330, 102, "名前", clean(inputs.myName, "なまえ"), t, 34);
  field(ctx, 72, 685, 330, 102, "MBTI / 恋愛タイプ", clean(inputs.myType, "MBTI / 恋愛タイプ"), t, 30);
  field(ctx, 430, 180, 255, 106, "年齢 / 性別", `${clean(inputs.myAge, "年齢")} / ${clean(inputs.myGender, "性別")}`, t, 30);
  field(ctx, 710, 180, 255, 106, "記念日", clean(inputs.anniversary, "記念日"), t, 30);
  field(ctx, 430, 306, 255, 106, "お相手", clean(inputs.loverName, "お相手"), t, 30);
  field(ctx, 710, 306, 255, 106, "出会い", clean(inputs.meet, "出会い"), t, 28);
  field(ctx, 430, 432, 255, 106, "年齢差", clean(inputs.ageGap, "年齢差"), t, 30);
  field(ctx, 710, 432, 255, 106, "身長差", clean(inputs.heightGap, "身長差"), t, 30);
  note(ctx, 430, 558, 535, 228, "ひとこと", clean(inputs.message, "ひとこと"), t);
  tags(ctx, 995, 180, 530, 154, "ステータス", checkedValues("relation"), "未設定", t, false);
  tags(ctx, 995, 354, 530, 215, "アカウント", checkedValues("account"), "ゆるく更新", t, false);
  tags(ctx, 995, 589, 530, 197, "NG", checkedValues("ng"), "自衛します", t, true);
  ctx.fillStyle = t.accent;
  ctx.font = "900 27px sans-serif";
  ctx.fillText("♡ 穏やかに仲良くしてください ♡", 92, 845);
  ctx.textAlign = "right";
  ctx.fillText("created by 恋垢プロフィールメーカー", 1508, 845);
  ctx.textAlign = "left";
}

function photoBox(ctx, x, y, w, h, t) {
  panel(ctx, x, y, w, h, 20, "rgba(255,255,255,.86)", t.line, 5);
  label(ctx, x + 22, y + 18, "プロフ画像", t);
  roundRect(ctx, x + 24, y + 72, w - 48, h - 96, 20, t.soft);
  dashedPanel(ctx, x + 24, y + 72, w - 48, h - 96, 20, t.line);
  const img = $("#avatarPreview img");
  if (avatarData && img?.complete) {
    ctx.save();
    clipRound(ctx, x + 32, y + 80, w - 64, h - 112, 16);
    coverImage(ctx, img, x + 32, y + 80, w - 64, h - 112);
    ctx.restore();
  } else {
    ctx.fillStyle = t.accent;
    ctx.font = "900 104px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("恋", x + w / 2, y + h / 2 + 58);
    ctx.textAlign = "left";
  }
}

function field(ctx, x, y, w, h, title, value, t, size) {
  panel(ctx, x, y, w, h, 20, "rgba(255,255,255,.86)", t.line, 5);
  label(ctx, x + 18, y + 14, title, t);
  ctx.fillStyle = t.ink;
  fitText(ctx, value, x + 22, y + h - 24, w - 44, size, 20, "900");
  dottedLine(ctx, x + 20, y + h - 16, x + w - 20, y + h - 16, t.line);
}

function note(ctx, x, y, w, h, title, value, t) {
  panel(ctx, x, y, w, h, 20, "rgba(255,255,255,.86)", t.line, 5);
  label(ctx, x + 18, y + 14, title, t);
  roundRect(ctx, x + 20, y + 72, w - 40, h - 94, 18, "#fff");
  ctx.fillStyle = t.ink;
  ctx.font = "30px sans-serif";
  wrapText(ctx, value, x + 42, y + 116, w - 84, 42, 3);
}

function tags(ctx, x, y, w, h, title, values, fallback, t, isNg) {
  panel(ctx, x, y, w, h, 20, "rgba(255,255,255,.86)", t.line, 5);
  label(ctx, x + 18, y + 14, title, t);
  let cx = x + 22;
  let cy = y + 76;
  const list = values.length ? values : [fallback];
  list.forEach((text) => {
    ctx.font = "900 25px sans-serif";
    const tw = Math.min(ctx.measureText(text).width + 48, 210);
    if (cx + tw > x + w - 22) {
      cx = x + 22;
      cy += 49;
    }
    pill(ctx, cx, cy, tw, 40, isNg ? "#fff" : t.soft);
    ctx.fillStyle = isNg ? "#75464e" : t.ink;
    ctx.fillText(text, cx + 24, cy + 28);
    cx += tw + 12;
  });
}

function label(ctx, x, y, text, t) {
  ctx.font = "900 23px sans-serif";
  const w = ctx.measureText(text).width + 38;
  pill(ctx, x, y, w, 36, t.soft);
  ctx.fillStyle = t.accent;
  ctx.fillText(text, x + 19, y + 26);
}

function panel(ctx, x, y, w, h, r, fill, stroke, lineWidth) {
  roundRect(ctx, x, y, w, h, r, fill);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  roundedPath(ctx, x, y, w, h, r);
  ctx.stroke();
}

function dashedPanel(ctx, x, y, w, h, r, color) {
  ctx.save();
  ctx.setLineDash([16, 14]);
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  roundedPath(ctx, x, y, w, h, r);
  ctx.stroke();
  ctx.restore();
}

function dottedLine(ctx, x1, y1, x2, y2, color) {
  ctx.save();
  ctx.setLineDash([2, 14]);
  ctx.lineCap = "round";
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

function blob(ctx, x, y, r, color) {
  ctx.save();
  ctx.globalAlpha = .9;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function pill(ctx, x, y, w, h, fill) {
  roundRect(ctx, x, y, w, h, h / 2, fill);
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

function roundRect(ctx, x, y, w, h, r, fill) {
  roundedPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

function clipRound(ctx, x, y, w, h, r) {
  roundedPath(ctx, x, y, w, h, r);
  ctx.clip();
}

function roundedPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function coverImage(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) * (Number(avatarY) / 100);
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

setTone("rose");
render();
