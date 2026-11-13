const params = new URLSearchParams(location.search);
const game = params.get("game") || "pokemon";
const id = params.get("id") || "basep-1";
const ui = {
  title: document.querySelector("#card-title"),
  image: document.querySelector("#card-image"),
  loading: document.querySelector("#image-loading"),
  game: document.querySelector("#game-label"),
  set: document.querySelector("#card-set"),
  id: document.querySelector("#card-id"),
  number: document.querySelector("#card-number"),
  crumbGame: document.querySelector("#crumb-game"),
  crumbName: document.querySelector("#crumb-name"),
  offers: document.querySelector("#offers-title"),
  subtitle: document.querySelector("#offers-subtitle"),
  list: document.querySelector("#seller-list"),
};
const sellers = [
  ["MilaCards", "MC", "Near Mint", "English", "2", "€12.50"],
  ["Northstar Collectibles", "NC", "Excellent", "English", "1", "€13.20"],
  ["Nico’s Binder", "NB", "Near Mint", "English", "1", "€14.00"],
  ["Card Corner", "CC", "Good", "English", "3", "€10.90"],
];
let loadedCard = null;
const cartKey = "cardcart-cart-v1";
function cartCount() {
  try {
    return (JSON.parse(localStorage.getItem(cartKey)) || []).reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
  } catch {
    return 0;
  }
}
function updateBadge() {
  document.querySelector(".cart i").textContent = cartCount();
}
function addToCart(seller, condition, price) {
  if (!loadedCard) return;
  let cart;
  try {
    cart = JSON.parse(localStorage.getItem(cartKey));
  } catch {}
  if (!Array.isArray(cart)) cart = [];
  const existing = cart.find(
    (item) =>
      item.game === game &&
      item.id === id &&
      item.seller === seller &&
      item.condition === condition,
  );
  if (existing) existing.quantity++;
  else
    cart.push({
      id,
      game,
      name: loadedCard.name,
      set: `${loadedCard.game} · ${loadedCard.set}`,
      condition,
      seller,
      price: Number(price.replace("€", "")),
      quantity: 1,
      image: loadedCard.image,
    });
  localStorage.setItem(cartKey, JSON.stringify(cart));
  updateBadge();
}
function renderSellers(name) {
  ui.offers.textContent = `${sellers.length} sellers for ${name}`;
  ui.subtitle.textContent = "Generic offer examples for this exact printing.";
  ui.list.innerHTML = "";
  sellers.forEach(
    ([seller, initials, condition, language, quantity, price]) => {
      const row = document.createElement("article");
      row.className = "seller";
      row.innerHTML = `<div class="seller-person"><span class="seller-avatar"></span><span><b></b><small>★ 4.9 · Verified seller</small></span></div><span><label>Condition</label><b>${condition}</b></span><span><label>Language</label><b>${language}</b></span><span><label>Quantity</label><b>${quantity}</b></span><span><strong>${price}</strong><button>Add to cart</button></span>`;
      row.querySelector(".seller-avatar").textContent = initials;
      row.querySelector(".seller-person b").textContent = seller;
      row.querySelector("button").addEventListener("click", (event) => {
        addToCart(seller, condition, price);
        event.currentTarget.textContent = "Added ✓";
        event.currentTarget.disabled = true;
      });
      ui.list.append(row);
    },
  );
}
async function load() {
  try {
    let card;
    if (game === "yugioh") {
      const res = await fetch(
        `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${encodeURIComponent(id)}`,
      );
      if (!res.ok) throw Error();
      const c = (await res.json()).data?.[0];
      if (!c) throw Error();
      card = {
        name: c.name,
        game: "Yu-Gi-Oh!",
        set: c.card_sets?.[0]?.set_name || "Set unavailable",
        number: c.card_sets?.[0]?.set_code || "—",
        image: c.card_images?.[0]?.image_url,
      };
    } else {
      const res = await fetch(
        `https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(id)}`,
      );
      if (!res.ok) throw Error();
      const c = await res.json();
      card = {
        name: c.name,
        game: "Pokémon",
        set: c.set?.name || "Set unavailable",
        number: c.localId || "—",
        image: c.image ? `${c.image}/high.webp` : null,
      };
    }
    loadedCard = card;
    ui.title.textContent = card.name;
    ui.game.textContent = card.game;
    ui.set.textContent = card.set;
    ui.id.textContent = id;
    ui.number.textContent = card.number;
    ui.crumbGame.textContent = card.game;
    ui.crumbName.textContent = card.name;
    document.title = `${card.name} — CardCart`;
    renderSellers(card.name);
    if (card.image) {
      ui.image.src = card.image;
      ui.image.alt = `${card.name} card`;
      ui.image.hidden = false;
    }
    ui.loading.hidden = true;
  } catch {
    ui.title.textContent = "Card could not load";
    ui.set.textContent =
      "Please return to the marketplace and choose another card.";
    ui.loading.textContent = "No card data available";
    renderSellers("this card");
  }
}
document
  .querySelector(".cart")
  .addEventListener("click", () => (location.href = "./cart.html"));
document
  .querySelector(".avatar")
  .addEventListener("click", () => (location.href = "./profile.html"));
updateBadge();
load();
