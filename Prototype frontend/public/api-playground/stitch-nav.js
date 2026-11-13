(() => {
  if (!document.documentElement.dataset.marketplaceHeaderReady && !document.querySelector('script[data-shared-marketplace-header]')) {
    const sharedHeader = document.createElement('script');
    sharedHeader.src = './marketplace-header.js?v=3';
    sharedHeader.async = false;
    sharedHeader.dataset.sharedMarketplaceHeader = 'true';
    document.head.append(sharedHeader);
  }

  const routes = {
    marketplace: './index.html', expansions: './search.html',
    cart: './cart.html', sell: './sell.html', wantlist: './profile.html', 'user-profile': './profile.html'
  };
  const selectedGame = new URLSearchParams(window.location.search).get('game');
  document.querySelectorAll('[data-path]').forEach((link) => {
    if (link.dataset.allSets) return;
    if (routes[link.dataset.path]) link.href = `${routes[link.dataset.path]}${selectedGame ? `?game=${encodeURIComponent(selectedGame)}` : ''}`;
  });
  document.querySelectorAll('[data-path="sell"]:not(.market-sell-link)').forEach((link) => link.remove());

  let items = [];
  try { items = JSON.parse(localStorage.getItem('cardcart-cart-v1')) || []; } catch (_) { items = []; }
  const quantity = items.reduce((total, item) => total + (Number(item.quantity) || 1), 0);
  document.querySelectorAll('[data-path="cart"]').forEach((link) => {
    const dot = link.querySelector('.absolute');
    if (!quantity) { if (dot) dot.remove(); return; }
    if (dot) {
      dot.textContent = quantity > 9 ? '9+' : quantity;
      dot.className = 'absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-primary text-on-primary text-[10px] leading-4 text-center font-bold';
    }
  });
})();
