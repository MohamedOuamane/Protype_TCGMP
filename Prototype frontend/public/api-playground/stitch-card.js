(() => {
  const params = new URLSearchParams(location.search);
  const game = params.get('game') || 'pokemon';
  const id = params.get('id') || 'base1-4';
  const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  const setText = (selector, text) => { const el = document.querySelector(selector); if (el) el.textContent = text; };
  const fetchCard = async () => {
    if (game === 'yugioh') {
      const data = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${encodeURIComponent(id)}`).then(r => r.json());
      const card = data.data?.[0]; if (!card) throw new Error('Not found');
      return { game, id: String(card.id), name: card.name, set: card.type || 'Yu-Gi-Oh!', image: card.card_images?.[0]?.image_url || '', description: card.desc || 'Yu-Gi-Oh! card', rarity: card.race || 'Trading card' };
    }
    const card = await fetch(`https://api.tcgdex.net/v2/en/cards/${encodeURIComponent(id)}`).then(r => r.json());
    return { game, id: card.id, name: card.name, set: card.set?.name || 'Pokémon TCG', image: card.image ? `${card.image}/high.webp` : '', description: [card.stage, card.hp ? `${card.hp} HP` : '', card.illustrator ? `Illus. ${card.illustrator}` : ''].filter(Boolean).join(' • ') || 'Pokémon trading card', rarity: card.rarity || 'Trading card' };
  };
  const update = (card) => {
    document.title = `${card.name} · TCG Market`;
    const heading = document.querySelector('h1'); if (heading) heading.textContent = card.name;
    const image = document.querySelector('main img'); if (image) { image.src = card.image; image.alt = card.name; }
    const sub = heading?.parentElement?.querySelector('p'); if (sub) sub.textContent = card.description;
    const pills = [...document.querySelectorAll('main span')].filter(el => el.className.includes('uppercase') && (el.textContent.includes('Base Set') || el.textContent.includes('Holo') || el.textContent.includes('#'))).slice(0, 3);
    [card.set, card.rarity, `ID ${card.id}`].forEach((text, index) => { if (pills[index]) pills[index].textContent = text; });
    [...document.querySelectorAll('nav a')].filter(a => a.textContent.includes('Pokémon') || a.textContent.includes('Base Set') || a.textContent.includes('Charizard')).forEach((item, index) => { item.textContent = index === 0 ? (card.game === 'pokemon' ? 'Pokémon' : 'Yu-Gi-Oh!') : index === 1 ? card.set : card.name; });
    const strip = [...document.querySelectorAll('span')].find(el => el.textContent.trim() === 'UPDATED: 2M AGO'); if (strip) strip.textContent = 'LIVE API CARD DATA';
    const metrics = [...document.querySelectorAll('.font-metric-display')];
    metrics.forEach((metric) => { metric.textContent = '—'; const note = metric.parentElement?.querySelector('.font-label-mono:last-child'); if (note) note.textContent = 'Not provided by source API'; });
    const offerTitle = [...document.querySelectorAll('h2,h3')].find(el => /offer/i.test(el.textContent)); if (offerTitle) offerTitle.textContent = `${card.name} · prototype offers`;
    document.querySelectorAll('button').forEach((button) => {
      if (/\+\s*cart|add to cart/i.test(button.textContent)) {
        button.addEventListener('click', () => addToCart(card, button));
      }
      if (/sell this card/i.test(button.textContent)) button.addEventListener('click', () => { location.href = './cart.html'; });
    });
    const primary = [...document.querySelectorAll('button')].find(b => /wantlist/i.test(b.textContent));
    primary?.addEventListener('click', () => addToCart(card, primary));
  };
  const addToCart = (card, button) => {
    let cart = []; try { cart = JSON.parse(localStorage.getItem('cardcart-cart-v1')) || []; } catch (_) {}
    const match = cart.find(item => item.game === card.game && String(item.id) === String(card.id));
    if (match) match.quantity = (Number(match.quantity) || 1) + 1;
    else cart.push({ ...card, price: 0, condition: 'Demo offer', seller: 'Marketplace seller', quantity: 1 });
    localStorage.setItem('cardcart-cart-v1', JSON.stringify(cart));
    button.textContent = 'Added to cart';
    setTimeout(() => { button.textContent = '+ Cart'; }, 1400);
  };
  fetchCard().then(update).catch(() => {
    const heading = document.querySelector('h1'); if (heading) heading.textContent = 'Card unavailable';
    const sub = heading?.parentElement?.querySelector('p'); if (sub) sub.textContent = 'The public card catalogue did not return this card. Try a new search.';
  });
})();
