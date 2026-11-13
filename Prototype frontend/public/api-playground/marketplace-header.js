(() => {
  if (document.documentElement.dataset.marketplaceHeaderReady) return;
  document.documentElement.dataset.marketplaceHeaderReady = "true";
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "./marketplace-header.css?v=2";
  document.head.append(stylesheet);
  const mobileStylesheet = document.createElement("link");
  mobileStylesheet.rel = "stylesheet";
  mobileStylesheet.href = "./mobile-marketplace.css?v=3";
  document.head.append(mobileStylesheet);

  document.querySelector('link[rel="icon"]')?.remove();
  const favicon = document.createElement("link");
  favicon.rel = "icon";
  favicon.type = "image/png";
  favicon.href = "./assets/favicon.png";
  document.head.append(favicon);

  const selectedGame = new URLSearchParams(window.location.search).get("game");
  const isYugioh = selectedGame === "yugioh";
  const isPokemon = selectedGame === "pokemon";
  if (!isYugioh && !isPokemon) {
    window.location.replace("./welcome.html");
    return;
  }
  const gameName = isYugioh
    ? "Yu-Gi-Oh!"
    : isPokemon
      ? "Pokémon"
      : "Choose game";
  document.body.classList.toggle("game-yugioh", isYugioh);
  document.body.classList.toggle("game-pokemon", isPokemon);

  if (window.location.pathname.endsWith("/index.html")) {
    document
      .querySelector(
        "main > div.flex.flex-col > section.w-full.px-margin-desktop.py-space-xl",
      )
      ?.remove();
  }

  document.querySelectorAll('input[placeholder*="Search"]').forEach((input) => {
    input.placeholder = isYugioh
      ? "Search Yu-Gi-Oh! cards, sets, or card IDs…"
      : isPokemon
        ? "Search Pokémon cards, sets, or card IDs…"
        : input.placeholder;
    input.setAttribute("aria-label", input.placeholder);
  });

  const header = document.querySelector("header");
  const headerBar = header?.firstElementChild;
  const headerSearch = headerBar?.children[1];
  let searchMode =
    new URLSearchParams(window.location.search).get("mode") === "card"
      ? "card"
      : "all";
  if (headerSearch && !headerSearch.classList.contains("market-search-row")) {
    const scope = document.createElement("button");
    scope.type = "button";
    scope.className = "market-search-scope";
    scope.textContent = searchMode === "card" ? "Cards" : "All";
    scope.setAttribute("aria-expanded", "false");
    const scopeMenu = document.createElement("div");
    scopeMenu.className = "market-search-scope-menu";
    scopeMenu.hidden = true;
    ["All", "Sets", "Cards"].forEach((label) => {
      const option = document.createElement("button");
      option.type = "button";
      option.textContent = label;
      option.addEventListener("click", () => {
        searchMode = label
          .toLowerCase()
          .replace("sets", "set")
          .replace("cards", "card");
        document.dispatchEvent(
          new CustomEvent("market-search-mode", {
            detail: { mode: searchMode },
          }),
        );
        scope.textContent = label;
        scopeMenu.hidden = true;
        scope.setAttribute("aria-expanded", "false");
        headerSearch.querySelector("input")?.dispatchEvent(new Event("input"));
      });
      scopeMenu.append(option);
    });
    scope.addEventListener("click", () => {
      const open = !scopeMenu.hidden;
      scopeMenu.hidden = open;
      scope.setAttribute("aria-expanded", String(!open));
    });
    document.addEventListener("click", (event) => {
      if (!headerSearch.contains(event.target)) {
        scopeMenu.hidden = true;
        scope.setAttribute("aria-expanded", "false");
      }
    });
    headerSearch.classList.add("market-search-row");
    headerSearch.prepend(scope, scopeMenu);
    header.append(headerSearch);
    document.body.classList.add("market-search-below");
  }

  const autocompleteInput = headerSearch?.querySelector("input");
  const autocompleteHost = autocompleteInput?.parentElement;
  if (
    !window.location.pathname.endsWith("/search.html") &&
    autocompleteInput &&
    autocompleteHost &&
    !autocompleteHost.querySelector(".market-search-suggestions")
  ) {
    const suggestions = document.createElement("div");
    suggestions.className = "market-search-suggestions";
    suggestions.setAttribute("role", "listbox");
    suggestions.setAttribute("aria-label", "Card suggestions");
    autocompleteHost.append(suggestions);

    let matches = [];
    let selectedIndex = -1;
    let searchTimer;
    let requestNumber = 0;
    const closeSuggestions = () => {
      matches = [];
      selectedIndex = -1;
      suggestions.replaceChildren();
      suggestions.hidden = true;
    };
    const openMatch = (match) => {
      window.location.href =
        match.kind === "set"
          ? `./search.html?game=${match.game}&set=${encodeURIComponent(match.game === "pokemon" ? match.id : match.name)}`
          : `./card.html?game=${match.game}&id=${encodeURIComponent(match.id)}&name=${encodeURIComponent(match.name)}&set=${encodeURIComponent(match.set || '')}&image=${encodeURIComponent(match.image || '')}`;
    };
    const drawSuggestions = () => {
      suggestions.replaceChildren();
      matches.forEach((card, index) => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "market-search-suggestion";
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", String(index === selectedIndex));
        option.innerHTML = `<span class="market-search-suggestion__name"></span><span class="market-search-suggestion__meta"></span>`;
        option.querySelector(".market-search-suggestion__name").textContent =
          card.name;
        option.querySelector(".market-search-suggestion__meta").textContent =
          card.kind === "set"
            ? `Set · ${card.set}`
            : `${card.set} · ${card.game === "yugioh" ? "Yu-Gi-Oh!" : "Pokémon"}`;
        option.addEventListener("pointerdown", (event) => {
          event.preventDefault();
          openMatch(card);
        });
        suggestions.append(option);
      });
      suggestions.hidden = matches.length === 0;
    };
    let setsRequest;
    const findSetMatches = async (query) => {
      if (isPokemon) {
        const sets = await fetch(
          `https://api.tcgdex.net/v2/en/sets?name=${encodeURIComponent(query)}&sort:field=releaseDate&sort:order=DESC&pagination:page=1&pagination:itemsPerPage=4`,
        ).then((response) => (response.ok ? response.json() : []));
        return sets.map((set) => ({
          kind: "set",
          id: set.id,
          name: set.name,
          set: `${set.cardCount?.official || set.cardCount?.total || "—"} cards`,
          game: "pokemon",
        }));
      }
      setsRequest ||= fetch(
        "https://db.ygoprodeck.com/api/v7/cardsets.php",
      ).then((response) => (response.ok ? response.json() : []));
      const sets = await setsRequest;
      const term = query.toLowerCase();
      return sets
        .filter((set) => set.set_name.toLowerCase().includes(term))
        .slice(0, 4)
        .map((set) => ({
          kind: "set",
          name: set.set_name,
          set: `${set.set_code} · ${set.num_of_cards} cards`,
          game: "yugioh",
        }));
    };
    const findCardMatches = async (query) => {
      const request = isYugioh
        ? fetch(
            `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(query)}`,
          )
            .then((response) => (response.ok ? response.json() : { data: [] }))
            .then((payload) =>
              (payload.data || []).slice(0, 6).map((card) => ({
                kind: "card",
                id: String(card.id),
                name: card.name,
                set: card.type || "Yu-Gi-Oh!",
                game: "yugioh",
              })),
            )
        : fetch(
            `https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(query)}&sort:field=localId&sort:order=ASC&pagination:page=1&pagination:itemsPerPage=6`,
          )
            .then((response) => (response.ok ? response.json() : []))
            .then((payload) =>
              payload.slice(0, 6).map((card) => ({
                kind: "card",
                id: card.id,
                name: card.name,
                set: "Pokémon card",
                game: "pokemon",
              })),
            );
      const fixtures = window.TCGDemo?.searchCards(query, isYugioh ? 'yugioh' : 'pokemon').map((card) => ({
        kind: 'card', id: card.id, name: card.name, set: card.set, game: card.game,
        image: card.image, fallback: card.fallback, demo: true,
      })) || [];
      return request.catch(() => []).then((liveCards) => {
        const seen = new Set();
        return [...fixtures, ...liveCards].filter((card) => {
          const key = `${card.game}:${card.id}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });
    };
    const findMatches = async (query) => {
      const currentRequest = ++requestNumber;
      const groups = await Promise.allSettled([
        searchMode !== "card" ? findSetMatches(query) : [],
        searchMode !== "set" ? findCardMatches(query) : [],
      ]);
      if (currentRequest !== requestNumber) return;
      matches = groups.flatMap((result) => result.status === "fulfilled" ? result.value : []);
      selectedIndex = -1;
      drawSuggestions();
    };
    autocompleteInput.addEventListener("input", () => {
      clearTimeout(searchTimer);
      const query = autocompleteInput.value.trim();
      if (query.length < 2) {
        closeSuggestions();
        return;
      }
      searchTimer = window.setTimeout(
        () => findMatches(query).catch(closeSuggestions),
        220,
      );
    });
    autocompleteInput.addEventListener("keydown", (event) => {
      if (event.key === "ArrowDown" && matches.length) {
        event.preventDefault();
        selectedIndex = (selectedIndex + 1) % matches.length;
        drawSuggestions();
      }
      if (event.key === "ArrowUp" && matches.length) {
        event.preventDefault();
        selectedIndex = (selectedIndex - 1 + matches.length) % matches.length;
        drawSuggestions();
      }
      if (event.key === "Escape") closeSuggestions();
      if (event.key === "Enter" && searchMode === "set") {
        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.href = `./search.html?game=yugioh&setQuery=${encodeURIComponent(autocompleteInput.value.trim())}`;
      } else if (event.key === "Enter" && selectedIndex >= 0) {
        event.preventDefault();
        event.stopImmediatePropagation();
        openMatch(matches[selectedIndex]);
      }
    });
    autocompleteInput.addEventListener("blur", () =>
      window.setTimeout(closeSuggestions, 120),
    );
  }

  const brandArea = document.querySelector("header > div > div:first-child");
  const notificationLink = document.querySelector(
    'header [data-path="wantlist"]',
  );
  if (notificationLink) {
    notificationLink.removeAttribute("data-path");
    notificationLink.href = "#notifications";
    notificationLink.setAttribute("aria-label", "Notifications");
    notificationLink
      .querySelector(".material-symbols-outlined")
      ?.replaceChildren("notifications");
    notificationLink.addEventListener("click", (event) =>
      event.preventDefault(),
    );
  }
  const profileLink = document.querySelector(
    'header [data-path="user-profile"]',
  );
  if (profileLink && !profileLink.closest(".market-account-menu")) {
    const accountMenu = document.createElement("div");
    accountMenu.className = "market-account-menu";
    const accountButton = document.createElement("button");
    accountButton.type = "button";
    accountButton.className = "market-account-button";
    accountButton.setAttribute("aria-label", "Open account menu");
    accountButton.setAttribute("aria-expanded", "false");
    accountButton.innerHTML = profileLink.innerHTML;
    const accountOptions = document.createElement("div");
    accountOptions.className = "market-account-options";
    accountOptions.setAttribute("role", "menu");
    accountOptions.hidden = true;
    const profileUrl = `./profile.html?game=${encodeURIComponent(selectedGame)}`;
    accountOptions.innerHTML = `<a role="menuitem" href="${profileUrl}"><span class="material-symbols-outlined">person</span>Profile</a><a role="menuitem" href="./settings.html?game=${encodeURIComponent(selectedGame)}"><span class="material-symbols-outlined">settings</span>Settings</a><a role="menuitem" href="./messages.html?game=${encodeURIComponent(selectedGame)}"><span class="material-symbols-outlined">mail</span>Messages</a><a role="menuitem" href="${profileUrl}&view=orders"><span class="material-symbols-outlined">receipt_long</span>Orders</a><a role="menuitem" href="${profileUrl}&view=sales"><span class="material-symbols-outlined">storefront</span>Sales</a><a role="menuitem" href="./welcome.html"><span class="material-symbols-outlined">logout</span>Logout</a>`;
    const closeAccountMenu = () => {
      accountOptions.hidden = true;
      accountButton.setAttribute("aria-expanded", "false");
    };
    accountButton.addEventListener("click", () => {
      const open = !accountOptions.hidden;
      accountOptions.hidden = open;
      accountButton.setAttribute("aria-expanded", String(!open));
    });
    document.addEventListener("click", (event) => {
      if (!accountMenu.contains(event.target)) closeAccountMenu();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeAccountMenu();
    });
    accountMenu.append(accountButton, accountOptions);
    profileLink.replaceWith(accountMenu);
  }
  document
    .querySelectorAll('header [data-path="sell"]')
    .forEach((link) => link.remove());
  if (!brandArea || document.querySelector(".game-switcher")) return;
  const brandLink = brandArea.querySelector('a[data-path="marketplace"]');
  if (brandLink) {
    brandLink.className = "marketplace-logo-link";
    brandLink.href = `./index.html${selectedGame ? `?game=${encodeURIComponent(selectedGame)}` : ""}`;
    brandLink.innerHTML =
      '<img src="./assets/tcg-marketplace-logo.png" alt="TCG Marketplace">';
  }
  brandArea.querySelector('nav [data-path="marketplace"]')?.remove();
  const navigation = brandArea.querySelector("nav");
  const sellCallToAction = navigation?.querySelector(
    '[data-path="expansions"]',
  );
  if (sellCallToAction) {
    sellCallToAction.dataset.path = "sell";
    sellCallToAction.className = "market-sell-link";
    sellCallToAction.href = `./sell.html${selectedGame ? `?game=${encodeURIComponent(selectedGame)}` : ""}`;
    sellCallToAction.textContent = "Sell a card";
  }
  const gameMenu = document.createElement("div");
  gameMenu.className = "game-switcher-menu";
  const switcher = document.createElement("button");
  switcher.type = "button";
  switcher.className = `game-switcher${isYugioh ? " game-switcher--yugioh" : isPokemon ? " game-switcher--pokemon" : ""}`;
  switcher.setAttribute(
    "aria-label",
    `Current game: ${gameName}. Change game.`,
  );
  switcher.setAttribute("aria-expanded", "false");
  switcher.setAttribute("aria-controls", "game-switcher-options");
  switcher.innerHTML = `<span class="game-switcher__label">${gameName}</span><span class="material-symbols-outlined game-switcher__arrow" aria-hidden="true">expand_more</span>`;
  const options = document.createElement("div");
  options.id = "game-switcher-options";
  options.className = "game-switcher-options";
  options.setAttribute("role", "menu");
  options.hidden = true;
  options.innerHTML = `<a role="menuitem" class="game-switcher-option game-switcher-option--pokemon${isPokemon ? " is-current" : ""}" href="./index.html?game=pokemon"><span class="game-switcher-option__mark" aria-hidden="true"></span><span>Pokémon</span>${isPokemon ? '<span class="material-symbols-outlined" aria-hidden="true">check</span>' : ""}</a><a role="menuitem" class="game-switcher-option game-switcher-option--yugioh${isYugioh ? " is-current" : ""}" href="./index.html?game=yugioh"><span class="game-switcher-option__mark" aria-hidden="true"></span><span>Yu-Gi-Oh!</span>${isYugioh ? '<span class="material-symbols-outlined" aria-hidden="true">check</span>' : ""}</a>`;
  const closeGameMenu = () => {
    options.hidden = true;
    switcher.setAttribute("aria-expanded", "false");
  };
  switcher.addEventListener("click", () => {
    const isOpen = !options.hidden;
    options.hidden = isOpen;
    switcher.setAttribute("aria-expanded", String(!isOpen));
  });
  document.addEventListener("click", (event) => {
    if (!gameMenu.contains(event.target)) closeGameMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeGameMenu();
  });
  gameMenu.append(switcher, options);
  if (navigation) navigation.before(gameMenu);
  else brandArea.append(gameMenu);

  const actionArea = headerBar?.lastElementChild;
  const accountMenu = actionArea?.querySelector('.market-account-menu');
  const mobileMenuButton = document.createElement('button');
  mobileMenuButton.type = 'button';
  mobileMenuButton.className = 'market-mobile-menu-toggle';
  mobileMenuButton.setAttribute('aria-label', 'Open navigation menu');
  mobileMenuButton.setAttribute('aria-expanded', 'false');
  mobileMenuButton.setAttribute('aria-controls', 'market-mobile-navigation');
  mobileMenuButton.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">menu</span>';
  if (accountMenu) actionArea.insertBefore(mobileMenuButton, accountMenu);
  else actionArea?.append(mobileMenuButton);

  const mobileNavigation = document.createElement('nav');
  mobileNavigation.id = 'market-mobile-navigation';
  mobileNavigation.className = 'market-mobile-navigation';
  mobileNavigation.setAttribute('aria-label', 'Main navigation');
  mobileNavigation.hidden = true;
  const gameQuery = `?game=${encodeURIComponent(selectedGame)}`;
  [
    ['Marketplace', `./index.html${gameQuery}`, 'storefront'],
    ['Search cards', `./search.html${gameQuery}`, 'search'],
    ['Sell a card', `./sell.html${gameQuery}`, 'sell'],
    ['Shopping cart', `./cart.html${gameQuery}`, 'shopping_bag'],
    ['Wantlist', `./profile.html${gameQuery}`, 'bookmark'],
  ].forEach(([label, href, icon]) => {
    const link = document.createElement('a');
    link.className = 'market-mobile-navigation__link';
    link.href = href;
    link.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">${icon}</span><span>${label}</span>`;
    mobileNavigation.append(link);
  });
  header.append(mobileNavigation);
  const closeMobileNavigation = () => {
    mobileNavigation.hidden = true;
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    mobileMenuButton.setAttribute('aria-label', 'Open navigation menu');
    mobileMenuButton.firstElementChild.textContent = 'menu';
  };
  mobileMenuButton.addEventListener('click', () => {
    const open = mobileNavigation.hidden;
    mobileNavigation.hidden = !open;
    mobileMenuButton.setAttribute('aria-expanded', String(open));
    mobileMenuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    mobileMenuButton.firstElementChild.textContent = open ? 'close' : 'menu';
  });
  document.addEventListener('click', (event) => {
    if (!mobileNavigation.contains(event.target) && !mobileMenuButton.contains(event.target)) closeMobileNavigation();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileNavigation();
  });

  const marketHeading = [...document.querySelectorAll("h2")].find((heading) =>
    heading.textContent.includes("Trending Cards"),
  );
  marketHeading?.closest("section")?.setAttribute("id", "market-trending");

  if (isYugioh) {
    const expansionsHeading = [...document.querySelectorAll("h3")].find(
      (heading) => heading.textContent.trim() === "Top Expansions",
    );
    const expansionsSection = expansionsHeading?.closest("section");
    const expansionsGrid = expansionsSection?.querySelector(".grid");
    if (expansionsHeading && expansionsGrid) {
      expansionsHeading.textContent = "Latest Expansions";
      expansionsHeading.className =
        "font-headline-lg text-headline-lg text-on-surface";
      const allSetsLink = [...expansionsSection.querySelectorAll("a")].find(
        (link) => link.textContent.includes("View all sets"),
      );
      if (allSetsLink) {
        allSetsLink.dataset.allSets = "true";
        allSetsLink.href = "./search.html?game=yugioh&sets=all";
      }
      expansionsGrid.innerHTML =
        '<p class="col-span-full text-on-surface-variant font-body-sm">Loading latest Yu-Gi-Oh! expansions…</p>';
      fetch("https://db.ygoprodeck.com/api/v7/cardsets.php")
        .then((response) => (response.ok ? response.json() : []))
        .then((sets) => {
          const now = new Date();
          const latestSets = sets
            .filter(
              (set) =>
                set.tcg_date &&
                !set.set_name.toUpperCase().includes("PACK") &&
                new Date(`${set.tcg_date}T23:59:59`) <= now,
            )
            .sort((a, b) => new Date(b.tcg_date) - new Date(a.tcg_date))
            .slice(0, 5);
          expansionsGrid.replaceChildren();
          latestSets.forEach((set) => {
            const item = document.createElement("a");
            item.className =
              "latest-expansion-card bg-surface-container-lowest hover:bg-surface-container-low transition-colors rounded-lg p-space-md flex items-center gap-space-md cursor-pointer group";
            item.href = `./search.html?game=yugioh&set=${encodeURIComponent(set.set_name)}`;
            const artwork = document.createElement("img");
            artwork.className = "latest-expansion-card__art";
            artwork.src = set.set_image || "./assets/stardust-dragon-back.png";
            artwork.alt = "";
            const copy = document.createElement("span");
            copy.className = "flex flex-col min-w-0";
            const name = document.createElement("span");
            name.className =
              "font-headline-md text-[14px] leading-5 text-on-surface truncate";
            name.textContent = set.set_name;
            const meta = document.createElement("span");
            meta.className = "font-label-mono text-label-mono text-outline";
            meta.textContent = `${new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(new Date(`${set.tcg_date}T12:00:00`))} · ${set.num_of_cards} cards`;
            copy.append(name, meta);
            item.append(artwork, copy);
            expansionsGrid.append(item);
          });
          if (!latestSets.length)
            expansionsGrid.innerHTML =
              '<p class="col-span-full text-on-surface-variant font-body-sm">Latest expansions are unavailable right now.</p>';
        })
        .catch(() => {
          expansionsGrid.innerHTML =
            '<p class="col-span-full text-on-surface-variant font-body-sm">Latest expansions are unavailable right now.</p>';
        });
    }
  }

  if (isPokemon) {
    const expansionsHeading = [...document.querySelectorAll("h3")].find(
      (heading) => heading.textContent.trim() === "Top Expansions",
    );
    const expansionsSection = expansionsHeading?.closest("section");
    const expansionsGrid = expansionsSection?.querySelector(".grid");
    if (expansionsHeading && expansionsGrid) {
      expansionsHeading.textContent = "Latest Expansions";
      expansionsHeading.className =
        "font-headline-lg text-headline-lg text-on-surface";
      const allSetsLink = [...expansionsSection.querySelectorAll("a")].find(
        (link) => link.textContent.includes("View all sets"),
      );
      if (allSetsLink) allSetsLink.href = "./search.html?game=pokemon&sets=all";

      expansionsGrid.innerHTML =
        '<p class="col-span-full text-on-surface-variant font-body-sm">Loading latest Pokémon expansions…</p>';
      fetch("https://api.tcgdex.net/v2/en/sets")
        .then((response) => (response.ok ? response.json() : []))
        .then((sets) => {
          const featuredNames = [
            "Mega Evolution",
            "Destined Rivals",
            "Journey Together",
            "Prismatic Evolutions",
            "151",
          ];
          const latestSets = featuredNames
            .map((name) => sets.find((set) => set.name === name))
            .filter(Boolean);

          expansionsGrid.replaceChildren();
          latestSets.forEach((set) => {
            const item = document.createElement("a");
            item.className =
              "latest-expansion-card bg-surface-container-lowest hover:bg-surface-container-low transition-colors rounded-lg p-space-md flex items-center gap-space-md cursor-pointer group";
            item.href = `./search.html?game=pokemon&set=${encodeURIComponent(set.id)}`;

            const artwork = document.createElement("img");
            artwork.className = "latest-expansion-card__art";
            const assetUrl = set.logo || set.symbol;
            artwork.src = assetUrl
              ? `${assetUrl}.webp`
              : "./assets/pokemon-card-background.png";
            artwork.alt = `${set.name} set logo`;

            const copy = document.createElement("span");
            copy.className = "flex flex-col min-w-0";
            const name = document.createElement("span");
            name.className =
              "font-headline-md text-[14px] leading-5 text-on-surface truncate";
            name.textContent = set.name;
            const meta = document.createElement("span");
            meta.className = "font-label-mono text-label-mono text-outline";
            meta.textContent = `Pokémon · ${set.cardCount?.official || set.cardCount?.total || "—"} cards`;
            copy.append(name, meta);
            item.append(artwork, copy);
            expansionsGrid.append(item);
          });

          if (!latestSets.length)
            expansionsGrid.innerHTML =
              '<p class="col-span-full text-on-surface-variant font-body-sm">Latest expansions are unavailable right now.</p>';
        })
        .catch(() => {
          expansionsGrid.innerHTML =
            '<p class="col-span-full text-on-surface-variant font-body-sm">Latest expansions are unavailable right now.</p>';
        });
    }
  }
})();
