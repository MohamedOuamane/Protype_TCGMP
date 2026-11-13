(() => {
  const game = new URLSearchParams(location.search).get("game");
  const yugiohThreads = [
    {
      id: "lila",
      name: "Lila R.",
      role: "BUYER · YOUR LISTING",
      initials: "LR",
      time: "2m",
      unread: true,
      presence: "Active now",
      card: {
        id: "46986414",
        name: "Dark Magician",
        price: "Cardmarket · €0.02",
        image: "https://images.ygoprodeck.com/images/cards_small/46986414.jpg",
      },
      messages: [
        ["them", "Hi! Is the Dark Magician still available?", "10:21"],
        ["me", "Yes, it is. It is near mint and ready to ship.", "10:24"],
        ["them", "Great — could you ship it tomorrow?", "10:26"],
      ],
    },
    {
      id: "marc",
      name: "Marc V.",
      role: "SELLER · YOUR ORDER",
      initials: "MV",
      time: "18m",
      presence: "Usually replies within 1 hour",
      card: {
        id: "44508094",
        name: "Stardust Dragon",
        price: "Cardmarket · €0.51",
        image: "https://images.ygoprodeck.com/images/cards_small/44508094.jpg",
      },
      messages: [
        [
          "me",
          "Hello, is tracked shipping available for this card?",
          "Yesterday",
        ],
        [
          "them",
          "Yes, tracked shipping is available at checkout.",
          "Yesterday",
        ],
      ],
    },
    {
      id: "sarah",
      name: "Sarah K.",
      role: "BUYER · YOUR LISTING",
      initials: "SK",
      time: "1h",
      unread: true,
      presence: "Offline",
      card: {
        id: "76666602",
        name: "The Dragon that Devours the Dogma",
        price: "Cardmarket · €0.47",
        image: "https://images.ygoprodeck.com/images/cards_small/76666602.jpg",
      },
      messages: [
        ["them", "Would you accept €1.00 for the card?", "09:14"],
        ["me", "Thanks for the offer. I can do €1.15 plus shipping.", "09:27"],
      ],
    },
    {
      id: "Hiro",
      name: "Hiro T.",
      role: "SELLER · YOUR ORDER",
      initials: "HT",
      time: "Yesterday",
      presence: "Offline",
      card: {
        id: "98898163",
        name: "Grandtusk Dragon",
        price: "Cardmarket · €0.04",
        image: "https://images.ygoprodeck.com/images/cards_small/98898163.jpg",
      },
      messages: [
        [
          "them",
          "Your order has been packed and will ship tomorrow.",
          "Yesterday",
        ],
      ],
    },
  ];
  const pokemonThreads = [
    {
      id: "lila",
      name: "Lila R.",
      role: "BUYER · YOUR LISTING",
      initials: "LR",
      time: "2m",
      unread: true,
      presence: "Active now",
      card: {
        id: "base4-4",
        name: "Charizard",
        price: "Live Catalog",
        image: "./assets/pokemon-card-background.png",
      },
      messages: [
        ["them", "Hi! Is the Charizard still available?", "10:21"],
        ["me", "Yes, it is. It is near mint and ready to ship.", "10:24"],
        ["them", "Great — could you ship it tomorrow?", "10:26"],
      ],
    },
    {
      id: "marc",
      name: "Marc V.",
      role: "SELLER · YOUR ORDER",
      initials: "MV",
      time: "18m",
      presence: "Usually replies within 1 hour",
      card: {
        id: "base1-58",
        name: "Pikachu",
        price: "Live Catalog",
        image: "./assets/pokemon-card-background.png",
      },
      messages: [
        [
          "me",
          "Hello, is tracked shipping available for this card?",
          "Yesterday",
        ],
        [
          "them",
          "Yes, tracked shipping is available at checkout.",
          "Yesterday",
        ],
      ],
    },
    {
      id: "sarah",
      name: "Sarah K.",
      role: "BUYER · YOUR LISTING",
      initials: "SK",
      time: "1h",
      unread: true,
      presence: "Offline",
      card: {
        id: "base10-12",
        name: "Mewtwo",
        price: "Live Catalog",
        image: "./assets/pokemon-card-background.png",
      },
      messages: [
        ["them", "Would you accept an offer for the card?", "09:14"],
        ["me", "Thanks for the offer. I can work something out.", "09:27"],
      ],
    },
    {
      id: "hiro",
      name: "Hiro T.",
      role: "SELLER · YOUR ORDER",
      initials: "HT",
      time: "Yesterday",
      presence: "Offline",
      card: {
        id: "base2-4",
        name: "Jolteon",
        price: "Live Catalog",
        image: "./assets/pokemon-card-background.png",
      },
      messages: [
        [
          "them",
          "Your order has been packed and will ship tomorrow.",
          "Yesterday",
        ],
      ],
    },
  ];
  const threads = game === "pokemon" ? pokemonThreads : yugiohThreads;
  let active = threads[0];
  const list = document.querySelector("#thread-list-items"),
    log = document.querySelector("#message-log");
  const esc = (v) =>
    String(v).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const render = () => {
    list.innerHTML = threads
      .map(
        (t) =>
          `<button class="thread${t === active ? " is-active" : ""}" type="button" data-thread="${t.id}"><span class="thread__avatar">${t.initials}</span><span class="thread__body"><b>${t.name}</b><small>${t.messages.at(-1)[1]}</small></span><span>${t.unread ? '<i class="thread__unread"></i>' : `<small class="thread__time">${t.time}</small>`}</span></button>`,
      )
      .join("");
    document.querySelector("#conversation-avatar").textContent =
      active.initials;
    document.querySelector("#conversation-role").textContent = active.role;
    document.querySelector("#conversation-name").textContent = active.name;
    document.querySelector("#conversation-presence").textContent =
      active.presence;
    document.querySelector("#listing-image").src = active.card.image;
    document.querySelector("#listing-image").alt = active.card.name;
    document.querySelector("#listing-name").textContent = active.card.name;
    document.querySelector("#listing-price").textContent = active.card.price;
    document.querySelector("#listing-link").href =
      `./card.html?game=${encodeURIComponent(game)}&id=${active.card.id}`;
    log.innerHTML = active.messages
      .map(
        ([who, text, time]) =>
          `<article class="message message--${who}"><p>${esc(text)}</p><small>${time}</small></article>`,
      )
      .join("");
    log.scrollTop = log.scrollHeight;
    list.querySelectorAll("[data-thread]").forEach(
      (button) =>
        (button.onclick = () => {
          active = threads.find((t) => t.id === button.dataset.thread);
          active.unread = false;
          render();
        }),
    );
  };
  document.querySelector("#message-composer").onsubmit = (e) => {
    e.preventDefault();
    const input = document.querySelector("#message-input"),
      text = input.value.trim();
    if (!text) return;
    active.messages.push(["me", text, "Now"]);
    active.time = "Now";
    input.value = "";
    render();
  };
  document
    .querySelectorAll('[data-path="user-profile"]')
    .forEach(
      (link) => (link.href = `./profile.html?game=${encodeURIComponent(game)}`),
    );
  document.querySelector("header input")?.addEventListener("keydown", (e) => {
    if (
      e.key === "Enter" &&
      !e.defaultPrevented &&
      e.currentTarget.value.trim()
    )
      location.href = `./search.html?${new URLSearchParams({ q: e.currentTarget.value.trim(), game })}`;
  });
  render();
})();
