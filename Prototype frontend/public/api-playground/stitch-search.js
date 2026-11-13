(() => {
  const state = { game: 'all', results: [] };
  const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[c]));
  const searchPokemon = async (query) => {
    const items = await fetch(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(query)}&sort:field=localId&sort:order=ASC&pagination:page=1&pagination:itemsPerPage=32`).then(r => r.ok ? r.json() : []);
    return items.map(card => ({ game: 'pokemon', id: card.id, name: card.name, set: 'Pokémon card', image: card.image ? `${card.image}/low.webp` : './assets/pokemon-card-background.png' }));
  };
  const searchYugioh = async (query) => {
    const payload = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(query)}`).then(r => r.ok ? r.json() : { data: [] });
    return (payload.data || []).slice(0, 32).map(card => ({ game: 'yugioh', id: String(card.id), name: card.name, set: card.type || 'Yu-Gi-Oh!', image: card.card_images?.[0]?.image_url_small || '' }));
  };
  const searchYugiohSet = async (setName) => {
    const payload = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?cardset=${encodeURIComponent(setName)}`).then(r => r.ok ? r.json() : { data: [] });
    return (payload.data || []).map(card => ({ game: 'yugioh', id: String(card.id), name: card.name, set: setName, image: card.card_images?.[0]?.image_url_small || '' }));
  };
  const searchPokemonSet = async (setId) => {
    const set = await fetch(`https://api.tcgdex.net/v2/en/sets/${encodeURIComponent(setId)}`).then(r => r.ok ? r.json() : null);
    if (!set) return { name: setId, cards: [] };
    return {
      name: set.name,
      cards: (set.cards || []).map(card => ({
        game: 'pokemon',
        id: card.id,
        name: card.name,
        set: set.name,
        image: card.image ? `${card.image}/low.webp` : './assets/pokemon-card-background.png',
      })),
    };
  };
  const searchPokemonSets = async (query = '') => fetch(`https://api.tcgdex.net/v2/en/sets?${query ? `name=${encodeURIComponent(query)}&` : ''}sort:field=releaseDate&sort:order=DESC&pagination:page=1&pagination:itemsPerPage=100`).then(r => r.ok ? r.json() : []);
  let yugiohSetsRequest;
  const searchYugiohSets = async (query) => {
    yugiohSetsRequest ||= fetch('https://db.ygoprodeck.com/api/v7/cardsets.php').then(response => response.ok ? response.json() : []);
    const sets = await yugiohSetsRequest;
    return sets.filter(set => set.set_name.toLowerCase().includes(query.trim().toLowerCase()));
  };
  const resultCard = (card) => `<a class="group flex gap-space-md bg-surface-container-low rounded-lg p-space-md border border-white/5 hover:border-primary/50 transition-colors" href="./card.html?game=${card.game}&id=${encodeURIComponent(card.id)}">
    <div class="w-20 h-28 shrink-0 bg-surface-container-lowest rounded p-1"><img src="${esc(card.image)}" alt="${esc(card.name)}" class="w-full h-full object-contain" loading="lazy"></div>
    <div class="min-w-0 flex-1 py-1"><span class="font-label-mono text-label-mono uppercase text-primary">${card.game === 'pokemon' ? 'Pokémon' : 'Yu-Gi-Oh!'}</span><h3 class="font-headline-md text-headline-md text-on-surface mt-1 truncate">${esc(card.name)}</h3><p class="text-body-sm text-on-surface-variant mt-1 truncate">${esc(card.set)}</p><p class="font-label-mono text-label-mono text-outline mt-4">ID · ${esc(card.id)}</p></div><span class="material-symbols-outlined text-on-surface-variant self-center">arrow_forward</span>
  </a>`;
  const resultSet = (set) => `<a class="group flex gap-space-md bg-surface-container-low rounded-lg p-space-md border border-white/5 hover:border-primary/50 transition-colors" href="./search.html?game=yugioh&set=${encodeURIComponent(set.set_name)}"><div class="w-20 h-28 shrink-0 bg-surface-container-lowest rounded p-1"><img src="${esc(set.set_image || '')}" alt="${esc(set.set_name)}" class="w-full h-full object-contain" loading="lazy"></div><div class="min-w-0 flex-1 py-1"><span class="font-label-mono text-label-mono uppercase text-primary">Yu-Gi-Oh! set</span><h3 class="font-headline-md text-headline-md text-on-surface mt-1 truncate">${esc(set.set_name)}</h3><p class="text-body-sm text-on-surface-variant mt-1 truncate">${esc(set.set_code)} · ${esc(set.num_of_cards)} cards</p><p class="font-label-mono text-label-mono text-outline mt-4">Released ${esc(set.tcg_date || 'date unavailable')}</p></div><span class="material-symbols-outlined text-on-surface-variant self-center">arrow_forward</span></a>`;
  const resultPokemonSet = (set) => `<a class="group flex gap-space-md bg-surface-container-low rounded-lg p-space-md border border-white/5 hover:border-primary/50 transition-colors" href="./search.html?game=pokemon&set=${encodeURIComponent(set.id)}"><div class="w-20 h-28 shrink-0 bg-surface-container-lowest rounded p-1"><img src="${esc(set.logo ? `${set.logo}.webp` : set.symbol ? `${set.symbol}.webp` : './assets/pokemon-card-background.png')}" alt="${esc(set.name)} logo" class="w-full h-full object-contain" loading="lazy"></div><div class="min-w-0 flex-1 py-1"><span class="font-label-mono text-label-mono uppercase text-primary">Pokémon set</span><h3 class="font-headline-md text-headline-md text-on-surface mt-1 truncate">${esc(set.name)}</h3><p class="text-body-sm text-on-surface-variant mt-1 truncate">${esc(set.cardCount?.official || set.cardCount?.total || '—')} cards</p><p class="font-label-mono text-label-mono text-outline mt-4">Set ID · ${esc(set.id)}</p></div><span class="material-symbols-outlined text-on-surface-variant self-center">arrow_forward</span></a>`;
  const main = [...document.querySelectorAll('main')].find(el => el.className.includes('lg:col-span-9'));
  if (!main) return;
  const render = (message) => {
    const list = state.results.map(item => item.set_name ? resultSet(item) : resultCard(item)).join('');
    main.innerHTML = `<div class="flex flex-wrap items-end justify-between gap-space-md"><div><p class="font-label-mono text-label-mono text-primary uppercase">Live catalogue</p><h2 class="font-headline-lg text-headline-lg text-on-surface">${message || 'Search cards'}</h2><p class="text-body-sm text-on-surface-variant mt-1">Pokémon TCGdex and YGOPRODeck results · images and card data from their public APIs</p></div><span class="font-metric-mono text-metric-mono text-on-surface-variant">${state.results.length} RESULTS</span></div><div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">${list || '<p class="text-on-surface-variant">Enter at least 3 letters to search both catalogues.</p>'}</div>`;
  };
  const headerInput = document.querySelector('header input');
  let headerSearchMode = new URLSearchParams(location.search).get('mode') === 'card' ? 'card' : 'all';
  const params = new URLSearchParams(location.search);
  const requestedGame = params.get('game');
  if (requestedGame === 'yugioh' || requestedGame === 'pokemon') state.game = requestedGame;
  let suggestionBox;
  const suggestions = (cards) => {
    if (!suggestionBox) { suggestionBox = document.createElement('div'); suggestionBox.className = 'fixed z-[100] bg-surface-container-high border border-outline-variant rounded shadow-2xl max-h-72 overflow-auto'; document.body.append(suggestionBox); }
    const rect = headerInput.getBoundingClientRect(); Object.assign(suggestionBox.style, { left: `${rect.left}px`, top: `${rect.bottom + 6}px`, width: `${rect.width}px` });
    suggestionBox.innerHTML = cards.slice(0, 8).map(c => `<button type="button" class="suggestion w-full text-left px-3 py-2 hover:bg-surface-container flex justify-between gap-3"><span class="truncate">${esc(c.set_name || c.name)}</span><span class="text-outline text-xs shrink-0">${c.set_name ? 'Set' : c.game === 'pokemon' ? 'Pokémon' : 'Yu-Gi-Oh!'}</span></button>`).join('');
    [...suggestionBox.querySelectorAll('.suggestion')].forEach((button, index) => button.addEventListener('click', () => { const item = cards[index]; location.href = item.set_name ? `./search.html?game=yugioh&set=${encodeURIComponent(item.set_name)}` : `./card.html?game=${item.game}&id=${encodeURIComponent(item.id)}`; }));
  };
  const setSuggestions = (sets, game = 'yugioh') => {
    if (!suggestionBox) { suggestionBox = document.createElement('div'); suggestionBox.className = 'fixed z-[100] bg-surface-container-high border border-outline-variant rounded shadow-2xl max-h-72 overflow-auto'; document.body.append(suggestionBox); }
    const rect = headerInput.getBoundingClientRect();
    Object.assign(suggestionBox.style, { left: `${rect.left}px`, top: `${rect.bottom + 6}px`, width: `${rect.width}px` });
    suggestionBox.innerHTML = sets.slice(0, 8).map(set => `<button type="button" class="suggestion w-full text-left px-3 py-2 hover:bg-surface-container flex justify-between gap-3"><span class="truncate">${esc(game === 'pokemon' ? set.name : set.set_name)}</span><span class="text-outline text-xs shrink-0">Set</span></button>`).join('');
    [...suggestionBox.querySelectorAll('.suggestion')].forEach((button, index) => button.addEventListener('click', () => { const set = sets[index]; location.href = game === 'pokemon' ? `./search.html?game=pokemon&set=${encodeURIComponent(set.id)}` : `./search.html?game=yugioh&set=${encodeURIComponent(set.set_name)}`; }));
  };
  const run = async (query) => {
    const value = query.trim();
    if (value.length < 3) { state.results = []; render('Search needs 3 letters'); return []; }
    render(`Searching “${esc(value)}”…`);
    const jobs = [];
    if (state.game !== 'yugioh') jobs.push(searchPokemon(value));
    if (state.game !== 'pokemon') jobs.push(searchYugioh(value));
    if (headerSearchMode !== 'card' && state.game !== 'pokemon') jobs.push(searchYugiohSets(value));
    const groups = await Promise.allSettled(jobs);
    const matches = groups.flatMap(result => result.status === 'fulfilled' ? result.value : []);
    state.results = [...matches.filter(item => item.set_name), ...matches.filter(item => !item.set_name)];
    render(`Results for “${esc(value)}”`);
    return state.results;
  };
  const runSet = async (setName) => {
    const isPokemonSet = state.game === 'pokemon';
    render(`Loading ${esc(setName)}…`);
    try {
      if (isPokemonSet) {
        const set = await searchPokemonSet(setName);
        state.results = set.cards;
        render(`${esc(set.name)} · expansion cards`);
      } else {
        state.game = 'yugioh';
        state.results = await searchYugiohSet(setName);
        render(`${esc(setName)} · expansion cards`);
      }
    } catch (_) {
      state.results = [];
      render(`${esc(setName)} · expansion cards`);
    }
  };
  const runSetQuery = async (query) => {
    const value = query.trim();
    render(`Searching sets for “${esc(value)}”…`);
    try {
      const sets = await fetch('https://db.ygoprodeck.com/api/v7/cardsets.php').then(response => response.ok ? response.json() : []);
      const matches = sets.filter(set => set.set_name.toLowerCase().includes(value.toLowerCase())).sort((a, b) => new Date(b.tcg_date || 0) - new Date(a.tcg_date || 0));
      main.innerHTML = `<div class="flex flex-wrap items-end justify-between gap-space-md"><div><p class="font-label-mono text-label-mono text-primary uppercase">Yu-Gi-Oh! expansions</p><h2 class="font-headline-lg text-headline-lg text-on-surface">Sets matching “${esc(value)}”</h2><p class="text-body-sm text-on-surface-variant mt-1">Choose an expansion to browse every card in that set.</p></div><span class="font-metric-mono text-metric-mono text-on-surface-variant">${matches.length} RESULTS</span></div><div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">${matches.map(resultSet).join('') || '<p class="text-on-surface-variant">No matching expansions found.</p>'}</div>`;
    } catch (_) {
      main.innerHTML = '<p class="text-on-surface-variant">Could not load expansion results right now.</p>';
    }
  };
  const runPokemonSetQuery = async (query) => {
    const value = query.trim();
    render(`Searching sets for “${esc(value)}”…`);
    try {
      const sets = await searchPokemonSets(value);
      main.innerHTML = `<div class="flex flex-wrap items-end justify-between gap-space-md"><div><p class="font-label-mono text-label-mono text-primary uppercase">Pokémon expansions</p><h2 class="font-headline-lg text-headline-lg text-on-surface">Sets matching “${esc(value)}”</h2><p class="text-body-sm text-on-surface-variant mt-1">Choose an expansion to browse every card in that set.</p></div><span class="font-metric-mono text-metric-mono text-on-surface-variant">${sets.length} RESULTS</span></div><div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">${sets.map(resultPokemonSet).join('') || '<p class="text-on-surface-variant">No matching expansions found.</p>'}</div>`;
    } catch (_) {
      main.innerHTML = '<p class="text-on-surface-variant">Could not load expansion results right now.</p>';
    }
  };
  const runAllSets = async () => {
    if (state.game === 'pokemon') {
      render('Loading all Pokémon expansions…');
      try {
        const sets = await searchPokemonSets();
        let visibleCount = 20;
        const draw = () => {
          const visibleSets = sets.slice(0, visibleCount);
          const remaining = sets.length - visibleSets.length;
          main.innerHTML = `<div class="flex flex-wrap items-end justify-between gap-space-md"><div><p class="font-label-mono text-label-mono text-primary uppercase">Pokémon expansions</p><h2 class="font-headline-lg text-headline-lg text-on-surface">All sets</h2><p class="text-body-sm text-on-surface-variant mt-1">Newest releases first.</p></div><span class="font-metric-mono text-metric-mono text-on-surface-variant">${sets.length} SETS</span></div><div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">${visibleSets.map(resultPokemonSet).join('')}</div>${remaining > 0 ? `<div class="mt-space-xl flex justify-center"><button class="load-more-sets px-space-xl py-space-md rounded bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-mono text-label-mono transition-colors" type="button">Load 20 more · ${remaining} remaining</button></div>` : ''}`;
          main.querySelector('.load-more-sets')?.addEventListener('click', () => { visibleCount += 20; draw(); });
        };
        draw();
      } catch (_) {
        main.innerHTML = '<p class="text-on-surface-variant">Could not load expansions right now.</p>';
      }
      return;
    }
    render('Loading all Yu-Gi-Oh! expansions…');
    try {
      const sets = await fetch('https://db.ygoprodeck.com/api/v7/cardsets.php').then(response => response.ok ? response.json() : []);
      const orderedSets = sets.filter(set => set.tcg_date).sort((a, b) => new Date(b.tcg_date) - new Date(a.tcg_date));
      let visibleCount = 20;
      const draw = () => {
        const visibleSets = orderedSets.slice(0, visibleCount);
        const remaining = orderedSets.length - visibleSets.length;
        main.innerHTML = `<div class="flex flex-wrap items-end justify-between gap-space-md"><div><p class="font-label-mono text-label-mono text-primary uppercase">Yu-Gi-Oh! expansions</p><h2 class="font-headline-lg text-headline-lg text-on-surface">All sets</h2><p class="text-body-sm text-on-surface-variant mt-1">Newest releases first. Sets are revealed in small batches.</p></div><span class="font-metric-mono text-metric-mono text-on-surface-variant">${orderedSets.length} SETS</span></div><div class="grid grid-cols-1 md:grid-cols-2 gap-space-md">${visibleSets.map(resultSet).join('')}</div>${remaining > 0 ? `<div class="mt-space-xl flex justify-center"><button class="load-more-sets px-space-xl py-space-md rounded bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface font-label-mono text-label-mono transition-colors" type="button">Load 20 more · ${remaining} remaining</button></div>` : ''}`;
        main.querySelector('.load-more-sets')?.addEventListener('click', () => { visibleCount += 20; draw(); });
      };
      draw();
    } catch (_) {
      main.innerHTML = '<p class="text-on-surface-variant">Could not load expansions right now.</p>';
    }
  };
  document.addEventListener('market-search-mode', (event) => { headerSearchMode = event.detail?.mode || 'all'; });
  headerInput?.addEventListener('keydown', (event) => { if (event.key === 'Enter') { suggestionBox?.remove(); suggestionBox = null; if (headerSearchMode === 'set') { if (state.game === 'pokemon') runPokemonSetQuery(headerInput.value); else runSetQuery(headerInput.value); } else run(headerInput.value); } });
  let timer;
  headerInput?.addEventListener('input', () => {
    clearTimeout(timer);
    const value = headerInput.value;
    if (value.trim().length < 3) { suggestionBox?.remove(); suggestionBox = null; return; }
    timer = setTimeout(async () => {
      if (headerSearchMode === 'set') {
        try {
          if (state.game === 'pokemon') setSuggestions(await searchPokemonSets(value), 'pokemon');
          else {
            const sets = await fetch('https://db.ygoprodeck.com/api/v7/cardsets.php').then(response => response.ok ? response.json() : []);
            setSuggestions(sets.filter(set => set.set_name.toLowerCase().includes(value.toLowerCase())));
          }
        } catch (_) { suggestionBox?.remove(); suggestionBox = null; }
        return;
      }
      const jobs = [];
      if (state.game !== 'yugioh') jobs.push(searchPokemon(value));
      if (state.game !== 'pokemon') jobs.push(searchYugioh(value));
      if (headerSearchMode === 'all' && state.game !== 'pokemon') jobs.push(searchYugiohSets(value));
      const groups = await Promise.allSettled(jobs);
      const matches = groups.flatMap(result => result.status === 'fulfilled' ? result.value : []);
      suggestions([...matches.filter(item => item.set_name), ...matches.filter(item => !item.set_name)]);
    }, 250);
  });
  const labels = [...document.querySelectorAll('aside label')];
  labels.forEach((label) => { const name = label.textContent.trim().toLowerCase(); if (name.includes('pokemon') || name.includes('yu-gi-oh')) label.addEventListener('click', () => { state.game = name.includes('pokemon') ? 'pokemon' : 'yugioh'; run(headerInput?.value || params.get('q') || ''); }); });
  document.getElementById('reset-filters')?.addEventListener('click', () => { state.game = 'all'; });
  const initialSet = params.get('set');
  const initialSetQuery = params.get('setQuery');
  const allSets = params.get('sets') === 'all';
  const initial = params.get('q');
  if (allSets) { runAllSets(); } else if (initialSetQuery) { if (headerInput) headerInput.value = initialSetQuery; runSetQuery(initialSetQuery); } else if (initialSet) { runSet(initialSet); } else if (initial && headerInput) { headerInput.value = initial; run(initial); } else render();
})();
