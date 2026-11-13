(() => {
  const params = new URLSearchParams(location.search);
  const game = params.get('game') === 'yugioh' ? 'yugioh' : 'pokemon';
  const id = params.get('id') || 'base1-4';
  const demo = window.TCGDemo;
  const money = (amount) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(Number(amount) || 0);
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const fallbackCard = () => ({
    game, id, name: params.get('name') || `Card ${id}`,
    set: params.get('set') || (game === 'pokemon' ? 'Pokémon TCG' : 'Yu-Gi-Oh!'),
    image: params.get('image') || '', fallback: game === 'pokemon' ? './assets/pokemon-card-background.png' : './assets/stardust-dragon-back.png',
    number: id, rarity: 'Catalogue listing', description: 'Card details from the public catalogue.',
  });
  const loadCard = async () => {
    const fixture = demo?.findCard(game, id);
    if (fixture) return fixture;
    try {
      if (game === 'yugioh') {
        const response = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${encodeURIComponent(id)}`);
        if (!response.ok) throw new Error('Catalogue unavailable');
        const card = (await response.json()).data?.[0];
        if (!card) throw new Error('Card not found');
        return { ...fallbackCard(), id: String(card.id), name: card.name, set: card.card_sets?.[0]?.set_name || 'Yu-Gi-Oh! catalogue', image: card.card_images?.[0]?.image_url || '', rarity: card.card_sets?.[0]?.set_rarity || 'Catalogue card', description: `${card.type || 'Yu-Gi-Oh! card'} · ${card.atk ?? '—'} ATK / ${card.def ?? '—'} DEF` };
      }
      const response = await fetch(`https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(id)}`);
      if (!response.ok) throw new Error('Catalogue unavailable');
      const card = await response.json();
      return { ...fallbackCard(), id: card.id, name: card.name, set: card.set?.name || 'Pokémon TCG', number: card.localId || id, image: card.image ? `${card.image}/high.webp` : '', rarity: card.rarity || 'Catalogue card', description: [card.stage, card.hp ? `${card.hp} HP` : '', card.illustrator ? `Illustrated by ${card.illustrator}` : ''].filter(Boolean).join(' · ') || 'Pokémon trading card' };
    } catch {
      return fallbackCard();
    }
  };

  const cardImage = document.querySelector('main img');
  const title = document.querySelector('main h1');
  const setDescription = (card) => {
    document.title = `${card.name} · TCG Market`;
    if (title) title.textContent = card.number && card.number !== card.id ? `${card.name} ${card.number}` : card.name;
    const description = title?.parentElement?.querySelector('p');
    if (description) description.textContent = card.description || `${card.set} · ${card.rarity}`;
    if (cardImage) {
      cardImage.src = card.image || card.fallback;
      cardImage.alt = `${card.name} trading card`;
      cardImage.onerror = () => { cardImage.onerror = null; cardImage.src = card.fallback; };
    }
    const main = document.querySelector('main');
    const metaPills = [...main.querySelectorAll('span')].filter((element) => {
      const text = element.textContent.trim();
      return text === 'Base Set (1999)' || text === 'Holo Rare' || /^#\d+\//.test(text);
    }).slice(0, 3);
    [card.set, card.rarity, `#${card.number || card.id}`].forEach((text, index) => { if (metaPills[index]) metaPills[index].textContent = text; });

    const crumbs = [...main.querySelectorAll('a')].filter((link) => /Pokémon|Yu-Gi-Oh|Base Set|Charizard/.test(link.textContent));
    if (crumbs[0]) crumbs[0].textContent = card.game === 'pokemon' ? 'Pokémon' : 'Yu-Gi-Oh!';
    if (crumbs[1]) crumbs[1].textContent = card.set;
    const freshness = [...main.querySelectorAll('span')].find((element) => element.textContent.trim() === 'UPDATED: 2M AGO');
    if (freshness) freshness.textContent = 'DEMO OFFER DATA';
    const sourceBadge = [...main.querySelectorAll('span')].find((element) => element.textContent.trim() === 'INDEX REF: BS-004-H');
    if (sourceBadge) sourceBadge.textContent = `DEMO CARD · ${card.id}`;
    const offerHeading = [...main.querySelectorAll('h2,h3')].find((element) => /offers|marketplace/i.test(element.textContent));
    if (offerHeading) offerHeading.textContent = `Offers for ${card.name}`;
  };

  const initialCard = fallbackCard();
  const offers = demo?.offersFor({ ...initialCard, ...(demo?.findCard(game, id) || {}) }) || [];
  const main = document.querySelector('main');
  const metrics = [...main.querySelectorAll('.font-metric-display')];
  const metricCaptions = ['Lowest demo offer', 'Live market data not connected', 'No transaction history in demo', 'Across demo offers'];
  const updateMarketMetrics = () => {
    const lowest = offers[0];
    if (metrics[0]) metrics[0].textContent = lowest ? money(lowest.price) : '—';
    if (metrics[1]) metrics[1].textContent = '—';
    if (metrics[2]) metrics[2].textContent = '—';
    if (metrics[3]) metrics[3].textContent = String(offers.reduce((sum, offer) => sum + offer.quantity, 0));
    const textNodes = [...main.querySelectorAll('.font-label-mono')];
    const labels = ['From Price', 'Trend Price', '30-Day Avg', 'Demo Stock'];
    const staleTrend = [...main.querySelectorAll('span')].find((node) => /\+4\.8%/.test(node.textContent));
    if (staleTrend) staleTrend.textContent = 'Demo trend data unavailable';
    ['FROM', 'TREND PRICE', '30-DAY AVG'].forEach((label, index) => {
      const node = textNodes.find((element) => element.textContent.trim().toUpperCase() === label);
      if (node) node.textContent = labels[index];
    });
    const stockLabel = textNodes.find((element) => /available/i.test(element.textContent));
    if (stockLabel) stockLabel.textContent = labels[3];
    const captions = ['Lowest demo offer', 'Demo trend data unavailable', 'No transaction history in demo', 'Across demo offers'];
    metrics.forEach((metric, index) => {
      const card = metric.closest('.bg-surface-container-low, .bg-surface-container-lowest');
      const caption = card && [...card.querySelectorAll('.font-label-mono')].at(-1);
      if (caption) caption.textContent = captions[index];
    });
    const graphTitle = [...main.querySelectorAll('span')].find((node) => node.textContent.trim() === '30-Day Price Discovery & Volume');
    const graphContainer = graphTitle?.parentElement?.parentElement;
    if (graphContainer) graphContainer.innerHTML = `<div class="rounded-xl bg-surface-container-low p-space-lg border border-white/5"><p class="font-label-mono text-label-mono text-primary uppercase">Demo pricing</p><p class="mt-2 text-body-md text-on-surface-variant">Seller prices below are fixed prototype examples. They do not represent live market data.</p></div>`;
  };

  const updateStickyCart = () => {
    const strip = document.querySelector('[data-demo-sticky-cart]');
    if (!strip) return;
    const cart = demo?.readCart() || [];
    const summary = strip.querySelector('[data-demo-sticky-summary]');
    const totalLabel = strip.querySelector('[data-demo-sticky-total]');
    const action = strip.querySelector('[data-demo-sticky-action]');
    const units = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const total = cart.reduce((sum, item) => sum + Number(item.price || 0) * (Number(item.quantity) || 1) + Number(item.shipping || 0), 0);
    if (summary) summary.textContent = units ? `${units} item${units === 1 ? '' : 's'} in your demo cart` : `Lowest demo offer ${money(offers[0]?.price)} + ${money(offers[0]?.shipping)} shipping`;
    if (totalLabel) totalLabel.textContent = money(units ? total : (offers[0]?.price || 0) + (offers[0]?.shipping || 0));
    if (action) {
      action.querySelector('span')?.replaceChildren(document.createTextNode(units ? 'View cart' : 'Browse offers'));
      action.onclick = () => units
        ? location.assign(`./cart.html?game=${encodeURIComponent(game)}`)
        : document.querySelector('tbody')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const tbody = main.querySelector('tbody');
  const templateRow = tbody?.querySelector('tr');
  const gradeLabel = [...main.querySelectorAll('span')].find((element) => element.textContent.trim() === 'Grade:');
  const gradeButtons = gradeLabel?.parentElement?.querySelectorAll('button') || [];
  const languageSelect = [...main.querySelectorAll('select')][0];
  const regionSelect = [...main.querySelectorAll('select')][1];
  const sortSelect = [...main.querySelectorAll('select')][2];
  const maxPriceInput = main.querySelector('input[placeholder="500"]');
    const maxPriceLabel = [...main.querySelectorAll('span')].find((element) => element.textContent.trim() === 'MAX $:');
    if (maxPriceLabel) maxPriceLabel.textContent = 'MAX €:';
  let selectedGrade = 'ALL';

  const renderOffers = (card) => {
    if (!tbody || !templateRow || !demo) return;
    const language = languageSelect?.value || 'ALL';
    const region = regionSelect?.value || 'WORLD';
    const maxPrice = Number(maxPriceInput?.value) || Infinity;
    let visible = offers.filter((offer) => (selectedGrade === 'ALL' || offer.conditionCode === selectedGrade)
      && (language === 'ALL' || offer.language === language)
      && (region === 'WORLD' || (region === 'EU' && ['France', 'Germany', 'United Kingdom'].includes(offer.region)) || (region === 'US' && offer.region === 'United States') || (region === 'ASIA' && ['Japan', 'China', 'South Korea'].includes(offer.region)))
      && offer.price <= maxPrice);
    const sort = sortSelect?.selectedOptions?.[0]?.textContent.toLowerCase() || '';
    if (sort.includes('rating')) visible.sort((a, b) => parseFloat(b.sellerRating) - parseFloat(a.sellerRating));
    else if (sort.includes('condition')) visible.sort((a, b) => ['NM', 'EX', 'LP', 'PL'].indexOf(a.conditionCode) - ['NM', 'EX', 'LP', 'PL'].indexOf(b.conditionCode));
    else if (sort.includes('price: lowest')) visible.sort((a, b) => a.price - b.price);
    else visible.sort((a, b) => (a.price + a.shipping) - (b.price + b.shipping));
    tbody.replaceChildren();
    visible.forEach((offer) => {
      const row = templateRow.cloneNode(true);
      const cells = row.querySelectorAll('td');
      ['Seller', 'Condition', 'Language', 'Print variant', 'Ships from', 'Quantity', 'Price + shipping', 'Action'].forEach((label, index) => {
        if (cells[index]) cells[index].dataset.label = label;
      });
      cells[0].querySelector('span:first-child').textContent = offer.seller;
      cells[0].querySelector('span:nth-child(2)').textContent = `${offer.flag} ${offer.sellerRating}`;
      cells[1].querySelector('span').textContent = offer.conditionCode;
      cells[2].textContent = offer.language;
      cells[3].textContent = offer.edition;
      cells[4].textContent = offer.region;
      cells[5].textContent = String(offer.quantity);
      cells[6].querySelector('div:first-child').textContent = money(offer.price);
      cells[6].querySelector('div:nth-child(2)').textContent = `+${money(offer.shipping)} ship`;
      const button = cells[7].querySelector('button');
      button.replaceChildren(document.createElement('span'), document.createTextNode(' Add to cart'));
      button.firstElementChild.className = 'material-symbols-outlined text-[14px]';
      button.firstElementChild.textContent = 'add_circle';
      button.addEventListener('click', () => {
        const result = demo.addToCart(card, offer);
        if (!result.ok) {
          button.textContent = 'Stock limit reached';
          button.disabled = true;
          return;
        }
        button.textContent = 'Added ✓';
        button.disabled = true;
      });
      tbody.append(row);
    });
    if (!visible.length) {
      const row = document.createElement('tr');
      row.innerHTML = '<td colspan="8" class="p-space-lg text-center text-on-surface-variant">No demo offers match these filters. Adjust the filters to see more.</td>';
      tbody.append(row);
    }
    const pager = [...main.querySelectorAll('div')].find((element) => element.className.includes('justify-between') && element.textContent.includes('Showing 1–6 of 148 offers'));
    if (pager) {
      pager.replaceChildren();
      pager.append(make('span', 'font-label-mono text-label-mono text-outline', `Showing ${visible.length} sample offer${visible.length === 1 ? '' : 's'}`));
      pager.append(make('span', 'font-label-mono text-label-mono text-outline', 'Demo listings · stock may be limited'));
    }
  };

  const wireFilters = (card) => {
    gradeButtons.forEach((button) => button.addEventListener('click', () => {
      selectedGrade = button.textContent.trim().toUpperCase();
      gradeButtons.forEach((item) => item.classList.toggle('bg-primary', item === button));
      gradeButtons.forEach((item) => item.classList.toggle('text-on-primary', item === button));
      renderOffers(card);
    }));
    [languageSelect, regionSelect, sortSelect, maxPriceInput].filter(Boolean).forEach((control) => control.addEventListener('change', () => renderOffers(card)));
    maxPriceInput?.addEventListener('input', () => renderOffers(card));
    const applyButton = [...main.querySelectorAll('button')].find((button) => /apply/i.test(button.textContent));
    applyButton?.addEventListener('click', () => renderOffers(card));
  };

  const wireActions = (card) => {
    [...main.querySelectorAll('button')].find((button) => /wantlist/i.test(button.textContent))?.addEventListener('click', (event) => {
      let saved = [];
      try { saved = JSON.parse(localStorage.getItem('tcg-demo-wantlist') || '[]'); } catch {}
      const exists = saved.some((item) => item.game === card.game && String(item.id) === String(card.id));
      saved = exists ? saved.filter((item) => !(item.game === card.game && String(item.id) === String(card.id))) : [...saved, { game: card.game, id: String(card.id), name: card.name }];
      localStorage.setItem('tcg-demo-wantlist', JSON.stringify(saved));
      event.currentTarget.textContent = exists ? '♡ Add to Wantlist' : '✓ Saved to Wantlist';
    });
    [...main.querySelectorAll('button')].find((button) => /sell this card/i.test(button.textContent))?.addEventListener('click', () => {
      location.href = `./sell.html?game=${card.game}&card=${encodeURIComponent(card.id)}`;
    });
  };

  loadCard().then((card) => {
    setDescription(card);
    const normalizedCard = { ...initialCard, ...card };
    updateMarketMetrics();
    renderOffers(normalizedCard);
    wireFilters(normalizedCard);
    wireActions(normalizedCard);
    updateStickyCart();
    document.addEventListener('tcg-cart-updated', updateStickyCart);
  });
})();
