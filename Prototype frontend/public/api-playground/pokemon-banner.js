if (new URLSearchParams(location.search).get("game") === "pokemon") {
  const featuredSources = [
    {
      name: "Giratina",
      image: "https://assets.tcgdex.net/en/swsh/swsh11/186/high.webp",
    },
    {
      name: "Lugia",
      image: "https://assets.tcgdex.net/en/swsh/swsh12/186/high.webp",
    },
    { name: "Mewtwo", query: "Mewtwo" },
  ];
  const banner = document.createElement("section");
  banner.className = "pokemon-intro-banner";
  banner.setAttribute("aria-label", "Pokémon featured banner");
  banner.innerHTML = `<div class="pokemon-intro-banner__copy"><p>FEATURED THIS WEEK</p><h2>Catch the cards<br><em>everyone wants.</em></h2><span>Live Pokémon TCG cards from the public catalogue.</span></div><div class="pokemon-intro-banner__cards"><div class="pokemon-banner-card-wrap"><a href="#market-trending" class="pokemon-banner-card" aria-label="View featured card: Giratina"><span class="pokemon-banner-card__transformer" aria-hidden="true"><span class="pokemon-banner-card__face pokemon-banner-card__face--front"><img src="./assets/pokemon-card-background.png" alt=""></span><span class="pokemon-banner-card__face pokemon-banner-card__face--back"><img src="./assets/pokemon-card-back.jpg" alt=""></span><span class="pokemon-banner-card__shine"></span></span></a><div class="pokemon-banner-card__controls" role="group" aria-label="Featured Pokémon navigation"><button class="pokemon-banner-card__nav pokemon-banner-card__nav--previous" type="button" aria-label="Show previous Pokémon"><span class="material-symbols-outlined" aria-hidden="true">chevron_left</span></button><span class="pokemon-banner-card__name" aria-live="polite">Giratina</span><button class="pokemon-banner-card__nav pokemon-banner-card__nav--next" type="button" aria-label="Show next Pokémon"><span class="material-symbols-outlined" aria-hidden="true">chevron_right</span></button></div></div></div>`;
  document.querySelector("header").insertAdjacentElement("afterend", banner);

  const featuredCard = banner.querySelector(".pokemon-banner-card");
  const transformer = featuredCard.querySelector(".pokemon-banner-card__transformer");
  const cardName = banner.querySelector(".pokemon-banner-card__name");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let turnFrame = null;
  let rotation = 4;
  const setCardImage = (card) => {
    const image = featuredCard.querySelector(".pokemon-banner-card__face--front img");
    image.src = card.image || "./assets/pokemon-card-background.png";
    image.alt = card.name;
  };
  const setCardContent = (card) => {
    setCardImage(card);
    cardName.textContent = card.name;
    featuredCard.setAttribute("aria-label", `View featured card: ${card.name}`);
  };
  const updateCard = (card, animate = true) => {
    if (!animate || reducedMotion) {
      setCardContent(card);
      return;
    }
    featuredCard.classList.add("is-swapping");
    const startedAt = performance.now();
    const duration = 450;
    const startingRotation = rotation;
    let swapped = false;
    const turn = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 0.5 - Math.cos(progress * Math.PI) / 2;
      const angle = startingRotation + eased * 360;
      const scale = 1 - Math.sin(progress * Math.PI) * 0.02;
      transformer.style.transform = `rotateY(${angle}deg) scale(${scale})`;
      featuredCard.style.setProperty("--shine-x", `${20 + eased * 60}%`);
      featuredCard.style.setProperty("--shine-y", `${22 + Math.sin(progress * Math.PI) * 22}%`);
      featuredCard.style.setProperty("--turn-light-x", `${38 + eased * 62}%`);
      featuredCard.style.setProperty("--turn-glow", `${0.28 + Math.sin(progress * Math.PI) * 0.48}`);
      if (!swapped && progress >= 0.5) {
        swapped = true;
        // The front face is turned away here, so the artwork can change unseen.
        setCardImage(card);
      }
      if (progress < 1) {
        turnFrame = window.requestAnimationFrame(turn);
      } else {
        // Keep the final angle in place. Clearing the transform here made the
        // card jump back to its resting pose before the rotation could finish.
        rotation = startingRotation + 360;
        transformer.style.transform = `rotateX(0deg) rotateY(${rotation}deg) scale(1)`;
        cardName.textContent = card.name;
        featuredCard.setAttribute("aria-label", `View featured card: ${card.name}`);
        featuredCard.style.removeProperty("--shine-x");
        featuredCard.style.removeProperty("--shine-y");
        featuredCard.style.removeProperty("--turn-light-x");
        featuredCard.style.removeProperty("--turn-glow");
        featuredCard.classList.remove("is-swapping");
        turnFrame = null;
      }
    };
    if (turnFrame) window.cancelAnimationFrame(turnFrame);
    turnFrame = window.requestAnimationFrame(turn);
  };
  featuredCard.addEventListener("pointermove", (event) => {
    if (turnFrame) return;
    const bounds = featuredCard.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    const tiltX = -y * 12;
    const tiltY = x * 16;
    transformer.style.transform = `translate3d(${x * 14}px, ${y * 10}px, 18px) rotateX(${tiltX}deg) rotateY(${rotation + tiltY}deg) scale(1.025)`;
    // A reflected highlight appears on the side opposite the pointer.
    const reflectedX = (0.5 - x) * 100;
    featuredCard.style.setProperty("--shine-x", `${reflectedX}%`);
    featuredCard.style.setProperty("--shine-y", `${(y + 0.5) * 100}%`);
    featuredCard.style.setProperty("--turn-light-x", `${reflectedX}%`);
    featuredCard.style.setProperty("--turn-glow", `${0.3 + Math.abs(x) * 0.32}`);
  });
  featuredCard.addEventListener("pointerleave", () => {
    if (turnFrame) return;
    transformer.style.transform = `rotateX(0deg) rotateY(${rotation}deg) scale(1)`;
    featuredCard.style.removeProperty("--shine-x");
    featuredCard.style.removeProperty("--shine-y");
    featuredCard.style.removeProperty("--turn-light-x");
    featuredCard.style.removeProperty("--turn-glow");
  });
  const previousButton = banner.querySelector(".pokemon-banner-card__nav--previous");
  const nextButton = banner.querySelector(".pokemon-banner-card__nav--next");
  let triggerCard = null;
  let scheduleNextCard = null;
  previousButton.addEventListener("click", () => {
    if (triggerCard?.(-1)) scheduleNextCard?.();
  });
  nextButton.addEventListener("click", () => {
    if (triggerCard?.(1)) scheduleNextCard?.();
  });

  const featuredCards = featuredSources.filter((source) => source.image);
  let activeIndex = 0;
  let nextCardTimer = null;
  updateCard(featuredCards[activeIndex], false);
  triggerCard = (direction) => {
    if (turnFrame) return false;
    activeIndex = (activeIndex + direction + featuredCards.length) % featuredCards.length;
    updateCard(featuredCards[activeIndex]);
    return true;
  };
  scheduleNextCard = () => {
    window.clearTimeout(nextCardTimer);
    nextCardTimer = window.setTimeout(() => {
      triggerCard(1);
      scheduleNextCard();
    }, 4000);
  };
  scheduleNextCard();

  const delayedSource = featuredSources.find((source) => source.query);
  if (delayedSource) {
    fetch(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(delayedSource.query)}`)
      .then((response) => (response.ok ? response.json() : []))
      .then((cards) => cards[0])
      .then((card) =>
        card
          ? fetch(`https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(card.id)}`).then(
              (response) => (response.ok ? response.json() : card),
            )
          : null,
      )
      .then((card) => {
        if (card?.image) featuredCards.push({ name: delayedSource.name, image: `${card.image}/high.webp` });
      })
      .catch(() => {});
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "./pokemon-banner.css";
  document.head.append(link);
}
