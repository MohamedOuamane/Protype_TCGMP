(() => {
  const catalog = [
    { game: 'pokemon', id: 'me6-138', name: 'Mega Rayquaza ex', set: 'Mega Evolution—Delta Reign', number: '138/103', rarity: 'Special Illustration Rare', description: 'Mega Evolution—Delta Reign · Special Illustration Rare', basePrice: 42, image: 'https://images.scrydex.com/pokemon/me6-138/large', fallback: './assets/pokemon-card-background.png', aliases: ['rayquaza', 'delta reign'] },
    { game: 'pokemon', id: 'me6-141', name: 'Mega Rayquaza ex', set: 'Mega Evolution—Delta Reign', number: '141/103', rarity: 'Mega Hyper Rare', description: 'Mega Evolution—Delta Reign · Mega Hyper Rare', basePrice: 35, image: 'https://images.scrydex.com/pokemon/me6-141/large', fallback: './assets/pokemon-card-background.png', aliases: ['rayquaza', 'delta reign'] },
    { game: 'pokemon', id: 'me6-136', name: 'Raikou ex', set: 'Mega Evolution—Delta Reign', number: '136/103', rarity: 'Special Illustration Rare', description: 'Mega Evolution—Delta Reign · Special Illustration Rare', basePrice: 17, image: 'https://images.scrydex.com/pokemon/me6-136/large', fallback: './assets/pokemon-card-background.png', aliases: ['delta reign'] },
    { game: 'pokemon', id: 'me6-114', name: 'Eevee', set: 'Mega Evolution—Delta Reign', number: '114/103', rarity: 'Illustration Rare', description: 'Mega Evolution—Delta Reign · Illustration Rare', basePrice: 6.5, image: 'https://images.scrydex.com/pokemon/me6-114/large', fallback: './assets/pokemon-card-background.png', aliases: ['delta reign'] },
    { game: 'pokemon', id: 'me6-105', name: 'Sprigatito', set: 'Mega Evolution—Delta Reign', number: '105/103', rarity: 'Illustration Rare', description: 'Mega Evolution—Delta Reign · Illustration Rare', basePrice: 5, image: 'https://images.scrydex.com/pokemon/me6-105/large', fallback: './assets/pokemon-card-background.png', aliases: ['delta reign'] },
    { game: 'pokemon', id: 'swsh11-186', name: 'Giratina V', set: 'Lost Origin', number: '186/196', rarity: 'Ultra Rare · Alternate Art', description: 'Sword & Shield—Lost Origin · 186/196 · Alternate Art', basePrice: 89, image: 'https://assets.tcgdex.net/en/swsh/swsh11/186/high.webp', fallback: './assets/pokemon-card-background.png', aliases: ['giratina'] },
    { game: 'pokemon', id: 'swsh12-186', name: 'Lugia V', set: 'Silver Tempest', number: '186/195', rarity: 'Ultra Rare · Alternate Art', description: 'Sword & Shield—Silver Tempest · 186/195 · Alternate Art', basePrice: 110, image: 'https://assets.tcgdex.net/en/swsh/swsh12/186/high.webp', fallback: './assets/pokemon-card-background.png', aliases: ['lugia'] },
    { game: 'pokemon', id: 'base1-4', name: 'Charizard', set: 'Base Set', number: '4/102', rarity: 'Holo Rare', description: 'Base Set · Holo Rare · 120 HP', basePrice: 125, image: 'https://assets.tcgdex.net/en/base/base1/4/high.webp', fallback: './assets/pokemon-card-background.png', aliases: ['dracaufeu'] },
    { game: 'pokemon', id: 'base1-58', name: 'Pikachu', set: 'Base Set', number: '58/102', rarity: 'Common', description: 'Base Set · Common · 40 HP', basePrice: 7.5, image: 'https://assets.tcgdex.net/en/base/base1/58/high.webp', fallback: './assets/pokemon-card-background.png', aliases: [] },
    { game: 'pokemon', id: 'base1-2', name: 'Blastoise', set: 'Base Set', number: '2/102', rarity: 'Holo Rare', description: 'Base Set · Holo Rare · 100 HP', basePrice: 49, image: 'https://assets.tcgdex.net/en/base/base1/2/high.webp', fallback: './assets/pokemon-card-background.png', aliases: [] },
    { game: 'pokemon', id: 'base1-15', name: 'Venusaur', set: 'Base Set', number: '15/102', rarity: 'Holo Rare', description: 'Base Set · Holo Rare · 100 HP', basePrice: 42, image: 'https://assets.tcgdex.net/en/base/base1/15/high.webp', fallback: './assets/pokemon-card-background.png', aliases: [] },
    { game: 'pokemon', id: 'base1-10', name: 'Mewtwo', set: 'Base Set', number: '10/102', rarity: 'Holo Rare', description: 'Base Set · Holo Rare · 60 HP', basePrice: 24.5, image: 'https://assets.tcgdex.net/en/base/base1/10/high.webp', fallback: './assets/pokemon-card-background.png', aliases: [] },
    { game: 'yugioh', id: '89631139', name: 'Blue-Eyes White Dragon', set: 'Legend of Blue Eyes White Dragon', number: '89631139', rarity: 'Ultra Rare', description: 'Normal Monster · Dragon · 3000 ATK / 2500 DEF', basePrice: 34.5, image: 'https://images.ygoprodeck.com/images/cards/89631139.jpg', fallback: './assets/stardust-dragon-back.png', aliases: ['blue eyes'] },
    { game: 'yugioh', id: '46986414', name: 'Dark Magician', set: 'Legend of Blue Eyes White Dragon', number: '46986414', rarity: 'Ultra Rare', description: 'Normal Monster · Spellcaster · 2500 ATK / 2100 DEF', basePrice: 12.5, image: 'https://images.ygoprodeck.com/images/cards/46986414.jpg', fallback: './assets/stardust-dragon-back.png', aliases: [] },
    { game: 'yugioh', id: '74677422', name: 'Red-Eyes Black Dragon', set: 'Legend of Blue Eyes White Dragon', number: '74677422', rarity: 'Ultra Rare', description: 'Normal Monster · Dragon · 2400 ATK / 2000 DEF', basePrice: 18, image: 'https://images.ygoprodeck.com/images/cards/74677422.jpg', fallback: './assets/stardust-dragon-back.png', aliases: ['red eyes'] },
  ];

  const sellerProfiles = [
    { seller: 'KantoCards', initials: 'KC', region: 'United Kingdom', flag: '🇬🇧', rating: '99.4%', condition: 'Near Mint', code: 'NM', language: 'EN', edition: 'Unlimited', offset: -1.25, shipping: 2.49, stock: 2 },
    { seller: 'PokéVault_DE', initials: 'PV', region: 'Germany', flag: '🇩🇪', rating: '99.8%', condition: 'Excellent', code: 'EX', language: 'EN', edition: 'Unlimited', offset: 0, shipping: 3.2, stock: 1 },
    { seller: 'Nico’s Binder', initials: 'NB', region: 'France', flag: '🇫🇷', rating: '98.7%', condition: 'Lightly Played', code: 'LP', language: 'FR', edition: 'First edition', offset: 2.8, shipping: 1.99, stock: 3 },
    { seller: 'TokyoTCG', initials: 'TT', region: 'Japan', flag: '🇯🇵', rating: '100%', condition: 'Near Mint', code: 'NM', language: 'JP', edition: 'Japanese original', offset: 5.4, shipping: 4.5, stock: 1 },
    { seller: 'Card Corner', initials: 'CC', region: 'United States', flag: '🇺🇸', rating: '98.9%', condition: 'Played', code: 'PL', language: 'EN', edition: 'Unlimited', offset: 7.5, shipping: 4.25, stock: 2 },
  ];

  const numberHash = (value) => [...String(value)].reduce((sum, char) => ((sum * 31) + char.charCodeAt(0)) >>> 0, 7);
  const findCard = (game, id) => catalog.find((card) => card.game === game && String(card.id) === String(id));
  const searchCards = (query, game = 'all') => {
    const term = String(query || '').trim().toLowerCase();
    if (!term) return [];
    return catalog.filter((card) => (game === 'all' || card.game === game)
      && [card.name, card.set, card.number, ...card.aliases].some((value) => value.toLowerCase().includes(term)));
  };

  const offersFor = (card) => {
    const fixture = findCard(card.game, card.id);
    const base = Number(fixture?.basePrice) || (4.5 + (numberHash(`${card.game}:${card.id}`) % 120));
    return sellerProfiles.map((seller) => ({
      offerId: `${card.game}:${card.id}:${seller.initials}`,
      game: card.game,
      id: String(card.id),
      name: card.name,
      set: card.set || fixture?.set || (card.game === 'pokemon' ? 'Pokémon TCG' : 'Yu-Gi-Oh!'),
      image: card.image || fixture?.image || '',
      fallback: fixture?.fallback || (card.game === 'pokemon' ? './assets/pokemon-card-background.png' : './assets/stardust-dragon-back.png'),
      seller: seller.seller,
      initials: seller.initials,
      sellerRating: seller.rating,
      region: seller.region,
      flag: seller.flag,
      condition: seller.condition,
      conditionCode: seller.code,
      language: seller.language,
      edition: seller.edition,
      price: Math.max(0.5, Math.round((base + seller.offset) * 100) / 100),
      shipping: seller.shipping,
      quantity: seller.stock,
    })).sort((a, b) => (a.price + a.shipping) - (b.price + b.shipping));
  };

  const readCart = () => {
    try {
      const value = JSON.parse(localStorage.getItem('cardcart-cart-v1') || '[]');
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  };
  const writeCart = (items) => {
    localStorage.setItem('cardcart-cart-v1', JSON.stringify(items));
    document.dispatchEvent(new CustomEvent('tcg-cart-updated', { detail: { cart: items } }));
    updateBadges(items);
  };
  const addToCart = (card, offer) => {
    const cart = readCart();
    const offerId = offer.offerId || `${card.game}:${card.id}:${offer.seller}`;
    const existing = cart.find((item) => item.offerId === offerId
      || (!item.offerId && item.game === card.game && String(item.id) === String(card.id) && item.seller === offer.seller));
    if (existing) {
      if ((Number(existing.quantity) || 1) >= (Number(offer.quantity) || 1)) return { ok: false, reason: 'stock' };
      existing.quantity = (Number(existing.quantity) || 1) + 1;
    } else {
      cart.push({
        offerId, game: card.game, id: String(card.id), name: card.name,
        set: card.set || findCard(card.game, card.id)?.set || '', image: card.image || '',
        fallback: offer.fallback || card.fallback || '', condition: offer.condition,
        conditionCode: offer.conditionCode, language: offer.language, edition: offer.edition,
        seller: offer.seller, sellerRating: offer.sellerRating, region: offer.region,
        price: Number(offer.price), shipping: Number(offer.shipping) || 0,
        stock: Number(offer.quantity) || 1, quantity: 1,
      });
    }
    writeCart(cart);
    return { ok: true, cart };
  };
  const updateBadges = (cart = readCart()) => {
    const units = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    document.querySelectorAll('[data-path="cart"]').forEach((link) => {
      let badge = link.querySelector('.absolute');
      if (!units) { badge?.remove(); return; }
      if (!badge) { badge = document.createElement('span'); link.append(badge); }
      badge.className = 'absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-on-primary text-[10px] leading-4 text-center font-bold';
      badge.textContent = units > 9 ? '9+' : String(units);
    });
  };

  window.TCGDemo = { catalog, sellerProfiles, findCard, searchCards, offersFor, readCart, writeCart, addToCart, updateBadges };
})();
