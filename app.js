const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let currentTone = "rose";
let avatarData = "";

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
  rose: {
    page: "#f6ecec",
    card: "#fff8f8",
    accent: "#c9828f",
    soft: "#efd2d6",
    ink: "#302a2d",
    muted: "#83777b",
  },
  cream: {
    page: "#f4efe1",
    card: "#fffaf0",
    accent: "#b79348",
    soft: "#ead7aa",
    ink: "#302a2d",
    muted: "#83777b",
  },
  mint: {
    page: "#eef4ef",
    card: "#fbfffc",
    accent: "#6f9d7f",
    soft: "#bdd8c7",
    ink: "#302a2d",
    muted: "#83777b",
  },
  sky: {
    page: "#edf4f8",
    card: "#f8fcff",
    accent: "#7098b5",
    soft: "#bfd7e8",
    ink: "#302a2d",
    muted: "#83777b",
  },
  mono: {
    page: "#f1efed",
    card: "#fbfaf8",
    accent: "#6d6668",
    soft: "#d9d5d2",
    ink: "#302a2d",
    muted: "#83777b",
  },
};

function clean(input, fallback) {
  return input.value.trim() || fallback;
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
  $("#card").className = `profile-card tone-${tone}`;
  $$(".tone-chip").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tone === tone);
  });
}

function setAvatar(src) {
  avatarData = src;
  $("#avatarPreview").innerHTML = src ? `<img src="${src}" alt="">` : "<span>恋</span>";
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

$$(".tone-chip").forEach((button) => {
  button.addEventListener("click", () => setTone(button.dataset.tone));
});

$("#avatar").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => setAvatar(reader.result));
  reader.readAsDataURL(file);
});

$("#clear").addEventListener("click", resetForm);
$("#save").addEventListener("click", saveImage);
$("#closeSheet").addEventListener("click", () => {
  $("#resultSheet").hidden = true;
});

async function saveImage() {
  const blob = await makePngBlob();
  const file = new File([blob], "renai-profile-card.png", { type: "image/png" });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "恋垢プロフィールカード",
      });
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
  const theme = themes[currentTone];
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = theme.card;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = theme.soft;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(70, 168);
  ctx.lineTo(1530, 168);
  ctx.stroke();

  ctx.fillStyle = theme.accent;
  ctx.font = "900 34px sans-serif";
  ctx.fillText("REN-AKA PROFILE", 70, 92);

  ctx.fillStyle = theme.ink;
  fitText(ctx, clean(inputs.myName, "なまえ"), 70, 150, 680, 82, 50, "900");

  ctx.textAlign = "right";
  ctx.fillStyle = theme.muted;
  ctx.font = "900 34px sans-serif";
  ctx.fillText(clean(inputs.anniversary, "記念日"), 1530, 104);
  ctx.textAlign = "left";

  drawAvatar(ctx, 72, 230, 210, theme);
  drawInfo(ctx, 320, 260, "age / gender", `${clean(inputs.myAge, "年齢")} / ${clean(inputs.myGender, "性別")}`, theme);
  drawInfo(ctx, 320, 385, "type", clean(inputs.myType, "MBTI / 恋愛タイプ"), theme);

  drawSectionTitle(ctx, "ふたりのこと", 690, 252, theme);
  drawBox(ctx, 690, 285, 190, 104, "お相手", clean(inputs.loverName, "お相手"), theme);
  drawBox(ctx, 900, 285, 190, 104, "年齢差", clean(inputs.ageGap, "年齢差"), theme);
  drawBox(ctx, 1110, 285, 190, 104, "身長差", clean(inputs.heightGap, "身長差"), theme);
  drawBox(ctx, 1320, 285, 190, 104, "出会い", clean(inputs.meet, "出会い"), theme);

  drawTagSection(ctx, "ステータス", checkedValues("relation"), "未設定", 690, 470, 800, theme, false);
  drawTagSection(ctx, "アカウント", checkedValues("account"), "ゆるく更新", 690, 585, 800, theme, false);
  drawTagSection(ctx, "NG", checkedValues("ng"), "自衛します", 690, 700, 800, theme, true);

  roundRect(ctx, 70, 645, 550, 170, 18, "rgba(255,255,255,.68)");
  ctx.fillStyle = theme.ink;
  ctx.font = "34px sans-serif";
  wrapText(ctx, clean(inputs.message, "ひとこと"), 100, 700, 490, 47, 3);
}

function drawAvatar(ctx, x, y, size, theme) {
  roundRect(ctx, x, y, size, size, 18, "#ffffff");
  if (avatarData) {
    const img = $("#avatarPreview img");
    if (img?.complete) {
      ctx.save();
      clipRound(ctx, x + 12, y + 12, size - 24, size - 24, 14);
      coverImage(ctx, img, x + 12, y + 12, size - 24, size - 24);
      ctx.restore();
      return;
    }
  }
  roundRect(ctx, x + 12, y + 12, size - 24, size - 24, 14, theme.accent);
  ctx.fillStyle = "#fff";
  ctx.font = "900 82px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("恋", x + size / 2, y + size / 2 + 30);
  ctx.textAlign = "left";
}

function drawInfo(ctx, x, y, label, text, theme) {
  ctx.fillStyle = theme.muted;
  ctx.font = "900 26px sans-serif";
  ctx.fillText(label, x, y);
  ctx.fillStyle = theme.ink;
  fitText(ctx, text, x, y + 50, 300, 36, 24, "900");
}

function drawSectionTitle(ctx, text, x, y, theme) {
  ctx.fillStyle = theme.accent;
  ctx.font = "900 30px sans-serif";
  ctx.fillText(text, x, y);
}

function drawBox(ctx, x, y, width, height, label, value, theme) {
  roundRect(ctx, x, y, width, height, 16, "rgba(255,255,255,.68)");
  ctx.fillStyle = theme.muted;
  ctx.font = "900 22px sans-serif";
  ctx.fillText(label, x + 18, y + 34);
  ctx.fillStyle = theme.ink;
  fitText(ctx, value, x + 18, y + 76, width - 36, 28, 20, "900");
}

function drawTagSection(ctx, title, values, fallback, x, y, maxWidth, theme, isNg) {
  drawSectionTitle(ctx, title, x, y, theme);
  let cursorX = x;
  let cursorY = y + 28;
  const list = values.length ? values : [fallback];
  list.forEach((text) => {
    ctx.font = "900 24px sans-serif";
    const width = Math.min(ctx.measureText(text).width + 46, 210);
    if (cursorX + width > x + maxWidth) {
      cursorX = x;
      cursorY += 48;
    }
    roundRect(ctx, cursorX, cursorY, width, 38, 19, isNg ? "rgba(255,255,255,.78)" : theme.soft);
    ctx.fillStyle = isNg ? "#75464e" : theme.ink;
    ctx.fillText(text, cursorX + 23, cursorY + 27);
    cursorX += width + 12;
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
  const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
  const sw = width / scale;
  const sh = height / scale;
  const sx = (img.naturalWidth - sw) / 2;
  const sy = (img.naturalHeight - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, width, height);
}

setTone("rose");
render();
