const BOUQUETS = [
  ["dm_photo_1", "Нежность в розовом", "Пионовидные розы, гвоздики, хризантемы и эустома в розовой упаковке", 130],
  ["dm_photo_2", "Персиковое облако", "Белые хризантемы, персиковые гвоздики и альстромерии", 70],
  ["dm_photo_3", "Розовый зефир", "Розовые гвоздики и белые хризантемы", 65],
  ["dm_photo_4", "Белая свежесть", "Белые хризантемы-помпоны и альстромерии", 90],
  ["dm_photo_5", "Классика страсти", "Красные розы в крафтовой упаковке", 100],
  ["dm_photo_6", "Утренний сад", "Белые хризантемы и розовые альстромерии", 100],
  ["dm_photo_7", "Французский шёлк", "Пудровые французские розы в крафте", 115],
  ["dm_photo_8", "Персиковый шёпот", "Пионовидные розы с эвкалиптом в кремовой упаковке", 70],
  ["dm_photo_9", "Ванильный крем", "Кремовые розы, гвоздики, хризантемы и эвкалипт", 80],
  ["dm_photo_10", "Розовая мечта", "Пионовидные розы, хризантемы и эвкалипт", 70]
];

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function cardHTML(bouquet) {
  const order = bouquet[1] + " — " + bouquet[3] + " BYN";
  return '<div class="card" data-p="' + bouquet[3] + '">' +
    '<div class="ph"><img loading="lazy" src="img/' + bouquet[0] + '.jpg" alt="' + esc(bouquet[1]) + '"></div>' +
    '<div class="b"><h3>' + esc(bouquet[1]) + '</h3><div class="d">' + esc(bouquet[2]) + '</div>' +
    '<div class="pr">' + bouquet[3] + ' BYN</div>' +
    '<button class="btn" type="button" data-order="' + esc(order) + '">Заказать</button></div></div>';
}

function renderCards(list, root) {
  root.innerHTML = list.map(cardHTML).join("");
}

let currentFilter = "all";
let currentSort = "";

function matchesFilter(price, filter) {
  if (filter === "lo") return price < 100;
  if (filter === "mid") return price >= 100 && price <= 150;
  if (filter === "hi") return price > 150;
  return true;
}

function catalogList() {
  let list = BOUQUETS.map((bouquet, index) => ({ bouquet, index }));
  list = list.filter((item) => matchesFilter(item.bouquet[3], currentFilter));
  if (currentSort === "asc") list.sort((a, b) => a.bouquet[3] - b.bouquet[3] || a.index - b.index);
  if (currentSort === "desc") list.sort((a, b) => b.bouquet[3] - a.bouquet[3] || a.index - b.index);
  return list.map((item) => item.bouquet);
}

function initCatalog() {
  const grid = document.getElementById("grid");
  if (!grid) return;
  const filters = document.getElementById("f");
  if (!filters) {
    const limit = +(grid.dataset.limit || 4);
    renderCards(BOUQUETS.slice(0, limit), grid);
    return;
  }
  const empty = document.getElementById("empty");
  const sortBox = document.getElementById("sort");
  const paint = () => {
    const list = catalogList();
    renderCards(list, grid);
    if (empty) empty.style.display = list.length ? "none" : "block";
  };
  filters.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || !button.dataset.f) return;
    currentFilter = button.dataset.f;
    filters.querySelectorAll("button").forEach((item) => item.classList.toggle("on", item === button));
    paint();
  });
  if (sortBox) {
    sortBox.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button || !button.dataset.s) return;
      currentSort = currentSort === button.dataset.s ? "" : button.dataset.s;
      sortBox.querySelectorAll("button").forEach((item) => item.classList.toggle("on", item.dataset.s === currentSort));
      paint();
    });
  }
  paint();
}

function closeNav() {
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  if (!nav) return;
  nav.classList.remove("open");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
}

function initNav() {
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav-toggle");
  if (!nav || !toggle) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("open")) return;
    if (event.target.closest("#site-nav") || event.target.closest(".nav-toggle")) return;
    closeNav();
  });
}

const orderModal = document.getElementById("m");
const orderForm = document.getElementById("form");
const orderOk = document.getElementById("ok");

function calc() {
  if (!orderForm) return;
  const pickup = orderForm.dl.value === "p";
  const price = +((document.getElementById("bq").value.match(/(\d+) BYN/) || [])[1] || 0);
  ["addr", "zone"].forEach((id) => {
    document.getElementById(id).style.display = pickup ? "none" : "";
  });
  document.getElementById("pick").style.display = pickup ? "" : "none";
  const delivery = pickup
    ? "самовывоз, бесплатно"
    : orderForm.zone.value === "out"
      ? "за МКАД — по согласованию с менеджером"
      : price >= 180
        ? "бесплатно (заказ от 180 BYN)"
        : "15 BYN";
  const total = price && !pickup && orderForm.zone.value === "in"
    ? "<br>Итого: <b>" + (price + (price >= 180 ? 0 : 15)) + " BYN</b>"
    : "";
  document.getElementById("sum").innerHTML = (price ? "Букет: <b>" + price + " BYN</b><br>" : "") + "Доставка: <b>" + delivery + "</b>" + total;
}

function openOrder(name) {
  if (!orderModal || !orderForm) return;
  closeNav();
  orderForm.reset();
  orderForm.style.display = "";
  orderOk.style.display = "none";
  document.getElementById("bq").value = name || "";
  document.getElementById("dt").min = new Date().toISOString().slice(0, 10);
  calc();
  orderModal.classList.add("open");
}

function closeOrder() {
  if (orderModal) orderModal.classList.remove("open");
}

if (orderModal && orderForm) {
  orderModal.addEventListener("click", (event) => {
    if (event.target === orderModal) closeOrder();
  });
  orderForm.addEventListener("change", calc);
  orderForm.addEventListener("input", calc);
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    orderForm.style.display = "none";
    orderOk.style.display = "block";
  });
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-order]");
  if (!button) return;
  openOrder(button.getAttribute("data-order"));
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeNav();
  closeOrder();
});

initNav();
initCatalog();
