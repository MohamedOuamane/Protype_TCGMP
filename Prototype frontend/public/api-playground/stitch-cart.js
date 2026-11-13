(() => {
  const demo = window.TCGDemo;
  if (!demo) return;
  const main = document.querySelector('main');
  const content = main?.querySelector('.max-w-7xl');
  const columns = [...(content?.querySelectorAll('div') || [])].find((element) => element.classList.contains('lg:grid-cols-12'));
  const left = columns?.querySelector('[class~="lg:col-span-7"]');
  const right = columns?.querySelector('[class~="lg:col-span-5"]');
  const sellerPanel = left?.querySelector('.bg-surface-container-low.rounded-xl');
  const summaryPanel = right?.querySelector('.bg-surface-container-low.rounded-xl');
  const checkoutButton = main?.querySelector('#pay-submit-btn');
  if (!main || !content || !columns || !sellerPanel || !summaryPanel || !checkoutButton) return;

  const money = (amount) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }).format(Number(amount) || 0);
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const migrateLegacyCart = () => {
    const cart = demo.readCart();
    let changed = false;
    const migrated = cart.map((item) => {
      if (item.offerId && Number(item.price) > 0) return item;
      const card = { ...item, id: String(item.id), image: item.image || '' };
      const offer = demo.offersFor(card).find((candidate) => candidate.seller === item.seller) || demo.offersFor(card)[0];
      if (!offer) return item;
      changed = true;
      return { ...offer, ...item, ...offer, quantity: Math.min(Number(item.quantity) || 1, offer.quantity) };
    });
    if (changed) demo.writeCart(migrated);
    return migrated;
  };

  let cart = migrateLegacyCart();
  const subtotal = () => cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const shippingTotal = () => {
    const sellers = new Map();
    cart.forEach((item) => { if (!sellers.has(item.seller)) sellers.set(item.seller, Number(item.shipping) || 0); });
    return [...sellers.values()].reduce((sum, value) => sum + value, 0);
  };

  const updateCartPresentation = () => {
    const units = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const itemRows = summaryPanel.querySelectorAll('div.flex.justify-between');
    const subLabel = itemRows[0]?.querySelector('span');
    const shipLabel = itemRows[1]?.querySelector('span');
    const subValue = itemRows[0]?.querySelector('span:nth-child(2)');
    const shipValue = itemRows[1]?.querySelector('span:nth-child(2)');
    const feeValue = itemRows[2]?.querySelector('span:nth-child(2)');
    const totalRow = itemRows[3];
    const totalValue = totalRow?.querySelector('.font-metric-display');
    const orderSubtotal = subtotal();
    const shipping = shippingTotal();
    const orderTotal = orderSubtotal + shipping;

    if (subLabel) subLabel.textContent = `Items (${units} ${units === 1 ? 'card' : 'cards'})`;
    if (shipLabel) shipLabel.textContent = 'Demo shipping';
    if (subValue) subValue.textContent = money(orderSubtotal);
    if (shipValue) shipValue.textContent = cart.length ? money(shipping) : '—';
    if (feeValue) feeValue.textContent = money(0);
    if (totalValue) totalValue.textContent = money(orderTotal);
    const taxNote = totalRow?.querySelector('.font-label-mono');
    if (taxNote) taxNote.textContent = 'Demo estimate · no tax charged';
    const title = content.querySelector('h2');
    if (title) title.textContent = cart.length ? 'Your cart & demo checkout' : 'Your cart is empty';
    const address = [...content.querySelectorAll('p')].find((element) => element.textContent.includes('Deliver to:'));
    if (address) address.textContent = 'Deliver to: Demo address · not saved';
    const addressEdit = [...content.querySelectorAll('button')].find((element) => element.textContent.trim() === 'Edit');
    if (addressEdit) { addressEdit.textContent = 'Demo only'; addressEdit.disabled = true; addressEdit.classList.add('opacity-60', 'cursor-not-allowed'); }

    const paymentLabel = [...summaryPanel.querySelectorAll('label')].find((element) => /Select Payment Option/i.test(element.textContent));
    if (paymentLabel) paymentLabel.textContent = 'Payment option preview';
    const protection = [...summaryPanel.querySelectorAll('p')].find((element) => element.textContent.includes('P2P Buyer Protection'));
    if (protection) protection.textContent = 'Prototype checkout only. No payment is processed and no order is sent to a seller.';

    checkoutButton.disabled = !cart.length;
    checkoutButton.classList.toggle('opacity-50', !cart.length);
    checkoutButton.classList.toggle('cursor-not-allowed', !cart.length);
    const buttonLabel = checkoutButton.querySelector('span:last-child');
    if (buttonLabel) buttonLabel.textContent = cart.length ? `Complete demo checkout · ${money(orderTotal)}` : 'Add an offer to continue';
    demo.updateBadges(cart);
  };

  const renderCartRows = () => {
    sellerPanel.replaceChildren();
    const heading = make('div', 'flex items-center gap-space-sm');
    const icon = make('span', 'material-symbols-outlined text-primary', 'storefront');
    const copy = make('div');
    copy.append(make('p', 'font-label-mono text-label-mono text-primary uppercase', 'Prototype marketplace offers'));
    copy.append(make('p', 'font-body-sm text-body-sm text-on-surface-variant', cart.length ? `${cart.length} selected seller offer${cart.length === 1 ? '' : 's'} · stored in this browser` : 'Your saved offers will appear here'));
    heading.append(icon, copy);
    sellerPanel.append(heading);

    if (!cart.length) {
      const empty = make('div', 'bg-surface-container-lowest p-space-lg rounded-lg text-center');
      empty.append(make('p', 'font-headline-md text-headline-md text-on-surface', 'Your cart is waiting for a great find.'));
      empty.append(make('p', 'mt-space-xs text-body-sm text-on-surface-variant', 'Browse the demo catalogue and add an offer from its seller list.'));
      const browse = make('a', 'inline-flex mt-space-md px-space-md py-space-xs rounded bg-primary text-on-primary font-label-mono text-label-mono', 'Browse cards');
      const game = new URLSearchParams(location.search).get('game');
      browse.href = `./search.html${game ? `?game=${encodeURIComponent(game)}` : ''}`;
      empty.append(browse);
      sellerPanel.append(empty);
      return;
    }

    cart.forEach((item, index) => {
      const row = make('div', 'market-cart-item bg-surface-container-lowest p-space-md rounded-lg flex flex-wrap sm:flex-nowrap items-center gap-space-md');
      const image = make('img', 'w-14 h-20 object-contain bg-white rounded shrink-0');
      image.src = item.image || item.fallback || '';
      image.alt = `${item.name} card`;
      image.onerror = () => { image.onerror = null; image.src = item.fallback || (item.game === 'pokemon' ? './assets/pokemon-card-background.png' : './assets/stardust-dragon-back.png'); };
      const details = make('div', 'min-w-0 flex-1');
      details.append(make('p', 'font-label-mono text-label-mono text-primary uppercase', item.game === 'pokemon' ? 'Pokémon' : 'Yu-Gi-Oh!'));
      details.append(make('p', 'font-body-md text-on-surface font-semibold truncate', item.name));
      details.append(make('p', 'font-body-sm text-on-surface-variant truncate', `${item.set || 'Card'} · ${item.condition} · ${item.language || 'EN'}`));
      details.append(make('p', 'font-label-mono text-label-mono text-outline mt-1', `${item.seller} · sample seller`));
      const controls = make('div', 'flex items-center gap-space-xs');
      const decrement = make('button', 'w-8 h-8 rounded bg-surface-container text-on-surface', '−');
      decrement.type = 'button'; decrement.setAttribute('aria-label', `Remove one ${item.name}`);
      const quantity = make('span', 'font-metric-mono text-on-surface min-w-5 text-center', String(item.quantity));
      const increment = make('button', 'w-8 h-8 rounded bg-surface-container text-on-surface', '+');
      increment.type = 'button'; increment.setAttribute('aria-label', `Add one ${item.name}`);
      const remove = make('button', 'text-outline hover:text-error p-space-xs', 'Remove');
      remove.type = 'button';
      decrement.addEventListener('click', () => {
        if (item.quantity <= 1) cart.splice(index, 1); else item.quantity--;
        demo.writeCart(cart); renderCartRows(); updateCartPresentation();
      });
      increment.addEventListener('click', () => {
        if (item.quantity >= item.stock) { increment.textContent = 'Stock limit'; increment.disabled = true; return; }
        item.quantity++; demo.writeCart(cart); renderCartRows(); updateCartPresentation();
      });
      remove.addEventListener('click', () => { cart.splice(index, 1); demo.writeCart(cart); renderCartRows(); updateCartPresentation(); });
      controls.append(decrement, quantity, increment, remove);
      row.append(image, details, make('strong', 'font-metric-mono text-on-surface whitespace-nowrap', `${money(item.price)} each`), controls);
      sellerPanel.append(row);
    });
  };

  const wirePaymentPreview = () => {
    const buttons = [...summaryPanel.querySelectorAll('.pay-method-btn')];
    buttons.forEach((button) => button.addEventListener('click', () => {
      buttons.forEach((option) => {
        option.classList.toggle('bg-surface-container-high', option === button);
        option.classList.toggle('text-on-surface', option === button);
        option.classList.toggle('bg-surface-container-lowest', option !== button);
        option.classList.toggle('text-on-surface-variant', option !== button);
      });
      let note = summaryPanel.querySelector('[data-demo-payment-note]');
      if (!note) { note = make('p', 'font-label-mono text-label-mono text-outline', 'Preview only · no payment will be processed.'); note.dataset.demoPaymentNote = 'true'; button.parentElement.after(note); }
    }));
  };

  const showConfirmation = () => {
    if (!cart.length) return;
    const orderId = `DEMO-${Date.now().toString().slice(-6)}`;
    const selectedGame = cart[0]?.game || 'pokemon';
    const orderItems = cart.map((item) => ({ name: item.name, seller: item.seller, quantity: item.quantity, price: item.price }));
    const total = subtotal() + shippingTotal();
    demo.writeCart([]);
    content.hidden = true;
    const confirmation = make('section', 'max-w-3xl mx-auto px-margin sm:px-margin-tablet lg:px-margin-desktop py-space-2xl');
    const panel = make('div', 'bg-surface-container-low rounded-xl p-space-xl sm:p-space-2xl border border-white/5 text-center');
    panel.append(make('span', 'material-symbols-outlined text-primary text-5xl', 'check_circle'));
    panel.append(make('p', 'font-label-mono text-label-mono text-primary uppercase mt-space-md', 'Demo order created'));
    panel.append(make('h2', 'font-headline-lg text-headline-lg text-on-surface mt-space-xs', 'Your checkout walkthrough is complete.'));
    panel.append(make('p', 'text-body-md text-on-surface-variant mt-space-sm', `Order ${orderId} · ${money(total)} estimated total`));
    panel.append(make('p', 'font-body-sm text-outline mt-space-md', 'This is a local prototype confirmation. No payment was taken and no order was sent to a seller.'));
    const list = make('div', 'text-left bg-surface-container-lowest rounded-lg p-space-md mt-space-xl space-y-space-sm');
    orderItems.forEach((item) => list.append(make('p', 'flex justify-between gap-space-md text-body-sm text-on-surface-variant', `${item.quantity} × ${item.name} · ${item.seller} — ${money(item.price * item.quantity)}`)));
    panel.append(list);
    const actions = make('div', 'flex flex-wrap justify-center gap-space-sm mt-space-xl');
    const browse = make('a', 'px-space-lg py-space-sm rounded bg-primary text-on-primary font-label-mono text-label-mono font-bold', 'Continue exploring');
    browse.href = `./index.html?game=${selectedGame}`;
    const back = make('a', 'px-space-lg py-space-sm rounded bg-surface-container text-on-surface font-label-mono text-label-mono', 'Search more cards');
    back.href = `./search.html?game=${selectedGame}`;
    actions.append(browse, back); panel.append(actions); confirmation.append(panel);
    main.append(confirmation);
  };

  checkoutButton.addEventListener('click', showConfirmation);
  wirePaymentPreview();
  document.addEventListener('tcg-cart-updated', (event) => {
    cart = event.detail?.cart || demo.readCart();
    renderCartRows(); updateCartPresentation();
  });
  renderCartRows();
  updateCartPresentation();
})();
