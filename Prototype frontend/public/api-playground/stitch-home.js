(() => {
  const pokemon = async (name) => {
    const list = await fetch(
      `https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(name)}`,
    ).then((r) => (r.ok ? r.json() : []));
    const card = list[0];
    if (!card) return null;
    const detail = await fetch(`https://api.tcgdex.net/v2/en/cards/${card.id}`)
      .then((r) => (r.ok ? r.json() : card))
      .catch(() => card);
    return {
      game: "pokemon",
      id: detail.id,
      name: detail.name,
      set: detail.set?.name || card.set?.name || "Pokémon TCG",
      image: detail.image ? `${detail.image}/high.webp` : "",
    };
  };
  const randomPokemon = () =>
    pokemon(
      [
        "Eevee",
        "Gengar",
        "Greninja",
        "Lucario",
        "Mew",
        "Rayquaza",
        "Snorlax",
        "Gardevoir",
      ][Math.floor(Math.random() * 8)],
    );
  const yugioh = async (name) => {
    const data = await fetch(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(name)}`,
    ).then((r) => (r.ok ? r.json() : { data: [] }));
    const card = data.data?.[0];
    return card
      ? {
          game: "yugioh",
          id: String(card.id),
          name: card.name,
          set: card.type || "Yu-Gi-Oh!",
          image:
            card.card_images?.[0]?.image_url_small ||
            card.card_images?.[0]?.image_url ||
            "",
          cardmarketPrice: card.card_prices?.[0]?.cardmarket_price || null,
        }
      : null;
  };
  const yugiohCard = async (id) => {
    const data = await fetch(
      `https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${encodeURIComponent(id)}`,
    ).then((r) => (r.ok ? r.json() : { data: [] }));
    const card = data.data?.[0];
    return card
      ? {
          game: "yugioh",
          id: String(card.id),
          name: card.name,
          set: card.type || "Yu-Gi-Oh!",
          image:
            card.card_images?.[0]?.image_url_small ||
            card.card_images?.[0]?.image_url ||
            "",
          cardmarketPrice: card.card_prices?.[0]?.cardmarket_price || null,
        }
      : null;
  };
  const randomYugiohCard = async () => {
    const randomUrl = "https://db.ygoprodeck.com/api/v7/randomcard.php";
    const fallbackUrl = `https://db.ygoprodeck.com/api/v7/cardinfo.php?num=1&offset=0&sort=random&cachebust=${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const data = await fetch(randomUrl)
      .then((r) =>
        r.ok
          ? r.json()
          : Promise.reject(new Error("Random card request failed")),
      )
      .catch(() =>
        fetch(fallbackUrl).then((r) => (r.ok ? r.json() : { data: [] })),
      );
    const card = data.data?.[0];
    return card
      ? {
          game: "yugioh",
          id: String(card.id),
          name: card.name,
          set: card.type || "Yu-Gi-Oh!",
          image:
            card.card_images?.[0]?.image_url_small ||
            card.card_images?.[0]?.image_url ||
            "",
          cardmarketPrice: card.card_prices?.[0]?.cardmarket_price || null,
        }
      : null;
  };
  const product = (
    card,
  ) => {
    const offer = window.TCGDemo?.offersFor(card)?.[0];
    const offerUrl = `./card.html?game=${card.game}&id=${encodeURIComponent(card.id)}&name=${encodeURIComponent(card.name)}&set=${encodeURIComponent(card.set || '')}&image=${encodeURIComponent(card.image || '')}`;
    return `<article class="group bg-surface-container-low rounded-lg overflow-hidden border border-white/5 transition hover:border-primary/50">
    <a href="${offerUrl}" class="block aspect-[3/4] bg-surface-container-lowest p-4"><img src="${card.image || (card.game === 'pokemon' ? './assets/pokemon-card-background.png' : './assets/stardust-dragon-back.png')}" onerror="this.onerror=null;this.src='${card.game === 'pokemon' ? './assets/pokemon-card-background.png' : './assets/stardust-dragon-back.png'}'" alt="${card.name}" class="w-full h-full object-contain group-hover:scale-[1.03] transition-transform" loading="lazy"></a>
    <div class="p-space-md"><p class="font-label-mono text-label-mono text-primary uppercase">${card.game === "pokemon" ? "Pokémon" : "Yu-Gi-Oh!"}</p><a href="${offerUrl}" class="block mt-1 font-headline-md text-headline-md text-on-surface truncate">${card.name}</a><p class="mt-1 text-body-sm text-on-surface-variant truncate">${card.set}</p><div class="mt-4 flex items-center justify-between gap-2"><span class="font-label-mono text-label-mono text-outline">${offer ? `From €${offer.price.toFixed(2)}` : 'Demo offers'}</span><a href="${offerUrl}" class="save-card px-3 py-1.5 rounded bg-primary text-on-primary font-label-mono text-label-mono">View offers →</a></div></div>
  </article>`;
  };
  const loadingProduct = (
    selectedGame,
  ) => `<article class="overflow-hidden rounded-lg border border-white/5 bg-surface-container-low">
    <div class="aspect-[3/4] bg-surface-container-lowest p-4"><img src="${selectedGame === "pokemon" ? "./assets/pokemon-card-background.png" : "./assets/stardust-dragon-back.png"}" alt="" class="h-full w-full animate-pulse object-contain"></div>
    <div class="p-space-md"><p class="font-label-mono text-label-mono text-primary uppercase">${selectedGame === "pokemon" ? "Pokémon" : "Yu-Gi-Oh!"}</p><p class="mt-1 font-headline-md text-headline-md text-on-surface">Loading card…</p><p class="mt-1 text-body-sm text-on-surface-variant">Live catalogue</p><div class="mt-4"><span class="font-label-mono text-label-mono text-outline">Loading price…</span></div></div>
  </article>`;
  const game = new URLSearchParams(window.location.search).get("game");
  let searchMode = "all";
  document.addEventListener("market-search-mode", (event) => {
    searchMode = event.detail?.mode || "all";
  });
  const go = (query) => {
    if (query.trim().length)
      window.location.href = `./search.html?${new URLSearchParams({ q: query.trim(), ...(game ? { game } : {}), ...(searchMode === "card" ? { mode: "card" } : {}) })}`;
  };
  document.querySelectorAll('input[placeholder*="Search"]').forEach((input) =>
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") go(input.value);
    }),
  );
  [...document.querySelectorAll("button")]
    .find((b) => b.textContent.includes("Search Market"))
    ?.addEventListener("click", () => {
      const input = [...document.querySelectorAll("input")].find((i) =>
        i.placeholder.includes("card name"),
      );
      go(input?.value || "");
    });
  const heading = [...document.querySelectorAll("h2")].find((h) =>
    h.textContent.includes("Trending Cards"),
  );
  const section = heading?.closest("section");
  const grid =
    section &&
    [...section.querySelectorAll("div")].find(
      (el) => el.className.includes("grid") && el.querySelector("img"),
    );
  if (!grid) return;
  grid.innerHTML =
    '<p class="col-span-full text-on-surface-variant font-body-md">Loading current cards from the public catalogues…</p>';
  if (game === "yugioh") {
    grid.className =
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-lg";
    grid.style.gap = "1.25rem";
    const demoCards = window.TCGDemo?.catalog.filter((card) => card.game === 'yugioh') || [];
    grid.innerHTML = demoCards.slice(0, 5).map(product).join("") || Array.from({ length: 5 }, () => loadingProduct("yugioh")).join("");
    Promise.allSettled([
      yugiohCard("44508094"),
      yugiohCard("76666602"),
      yugiohCard("46986414"),
      randomYugiohCard(),
      randomYugiohCard(),
    ]).then((results) => {
      const available = results
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => result.value);
      grid.innerHTML = available.length
        ? available.map(product).join("")
        : demoCards.slice(0, 5).map(product).join("");
    });
    return;
  }
  if (game === "pokemon") {
    grid.className =
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-lg";
    grid.style.gap = "1.25rem";
    const demoCards = window.TCGDemo?.catalog.filter((card) => card.game === 'pokemon') || [];
    grid.innerHTML = demoCards.slice(0, 5).map(product).join("") || Array.from({ length: 5 }, () => loadingProduct("pokemon")).join("");
    Promise.allSettled([
      pokemon("Giratina"),
      pokemon("Pikachu"),
      pokemon("Mewtwo"),
      randomPokemon(),
      randomPokemon(),
    ]).then((results) => {
      const available = results
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => result.value);
      grid.innerHTML = available.length
        ? available.map(product).join("")
        : demoCards.slice(0, 5).map(product).join("");
    });
    return;
  }
  const demoCards = window.TCGDemo?.catalog || [];
  grid.innerHTML = demoCards.slice(0, 4).map(product).join("");
  Promise.all([
    pokemon("Charizard"),
    pokemon("Pikachu"),
    yugioh("Blue-Eyes White Dragon"),
    yugioh("Dark Magician"),
  ])
    .then((cards) => {
      const available = cards.filter(Boolean);
      grid.innerHTML = available.length ? available.map(product).join("") : demoCards.slice(0, 4).map(product).join("");
    })
    .catch(() => {
      grid.innerHTML = demoCards.slice(0, 4).map(product).join("");
    });
})();
