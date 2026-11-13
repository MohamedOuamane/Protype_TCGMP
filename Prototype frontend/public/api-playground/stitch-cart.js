(() => {
  const key = 'cardcart-cart-v1';
  const read = () => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch (_) { return []; } };
  const write = (items) => localStorage.setItem(key, JSON.stringify(items));
  const price = (number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(number) || 0);
  let cart = read();
  const total = () => cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const render = () => {
    const anchor = document.querySelector('main h1')?.parentElement || document.querySelector('main');
    let panel = document.getElementById('local-cart-panel');
    if (!panel) { panel = document.createElement('section'); panel.id = 'local-cart-panel'; panel.className = 'max-w-7xl mx-auto mx-margin-desktop mt-6 bg-surface-container-low rounded-xl p-space-lg border border-white/5'; anchor.insertAdjacentElement('afterend', panel); }
    panel.innerHTML = `<div class="flex flex-wrap justify-between gap-3 mb-4"><div><p class="font-label-mono text-label-mono text-primary uppercase">Browser-local cart</p><h2 class="font-headline-md text-headline-md text-on-surface">${cart.length ? `${cart.reduce((n, i) => n + (Number(i.quantity) || 1), 0)} saved card${cart.length === 1 ? '' : 's'}` : 'Your cart is empty'}</h2></div><a href="./search.html" class="px-3 py-2 rounded bg-primary text-on-primary font-label-mono text-label-mono self-start">Browse cards</a></div>${cart.length ? `<div class="space-y-3">${cart.map((item, index) => `<div class="flex gap-3 items-center bg-surface-container-lowest p-3 rounded-lg"><img src="${item.image || ''}" alt="${item.name}" class="w-12 h-16 object-contain bg-surface-container rounded"><div class="min-w-0 flex-1"><p class="font-body-md text-on-surface truncate">${item.name}</p><p class="font-label-mono text-label-mono text-on-surface-variant">${item.game === 'pokemon' ? 'POKÉMON' : 'YU-GI-OH!'} · ${item.set || ''}</p></div><div class="flex items-center gap-2"><button data-down="${index}" class="w-7 h-7 rounded bg-surface-container text-on-surface">−</button><span class="font-metric-mono text-on-surface w-4 text-center">${item.quantity || 1}</span><button data-up="${index}" class="w-7 h-7 rounded bg-surface-container text-on-surface">+</button><button data-remove="${index}" class="ml-2 text-outline hover:text-error"><span class="material-symbols-outlined">delete</span></button></div></div>`).join('')}</div><p class="mt-4 font-label-mono text-label-mono text-outline">LIVE CATALOGUE CARDS DO NOT INCLUDE MARKET PRICES. CURRENT PROTOTYPE TOTAL: ${price(total())}</p>` : '<p class="text-on-surface-variant">Search for a card and add it from its offers page. Your saved cards stay in this browser.</p>'}`;
    panel.querySelectorAll('[data-up]').forEach(btn => btn.onclick = () => { cart[btn.dataset.up].quantity = (Number(cart[btn.dataset.up].quantity) || 1) + 1; write(cart); render(); });
    panel.querySelectorAll('[data-down]').forEach(btn => btn.onclick = () => { const item = cart[btn.dataset.down]; item.quantity = (Number(item.quantity) || 1) - 1; if (item.quantity < 1) cart.splice(btn.dataset.down, 1); write(cart); render(); });
    panel.querySelectorAll('[data-remove]').forEach(btn => btn.onclick = () => { cart.splice(btn.dataset.remove, 1); write(cart); render(); });
    const name = document.getElementById('card-name-input'); if (name && cart[0]) name.value = cart[0].name;
    const amount = document.getElementById('summary-price'); if (amount) amount.textContent = price(total());
  };
  document.getElementById('btn-list-card')?.addEventListener('click', () => {
    const name = document.getElementById('card-name-input')?.value.trim(); const entered = Number(document.getElementById('price-input')?.value);
    if (!name) return;
    cart.push({ id: `local-${Date.now()}`, game: 'prototype', name, set: 'Local prototype listing', image: '', quantity: 1, price: Number.isFinite(entered) ? entered : 0 }); write(cart); render();
  });
  document.getElementById('pay-submit-btn')?.addEventListener('click', () => alert('Prototype checkout only — no payment was submitted.'));
  render();
})();
