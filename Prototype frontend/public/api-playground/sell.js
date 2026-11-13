(() => {
  const priceInput = document.getElementById('price-input');
  const quantity = document.getElementById('qty-display');
  const summaryPrice = document.getElementById('summary-price');
  const summaryFee = document.getElementById('summary-fee');
  const summaryPayout = document.getElementById('summary-payout');
  const format = (value) => `$${Number(value || 0).toFixed(2)}`;
  const updateSummary = () => {
    const value = Math.max(0, Number(priceInput?.value) || 0);
    const fee = value * 0.05;
    if (summaryPrice) summaryPrice.textContent = format(value);
    if (summaryFee) summaryFee.textContent = `-${format(fee)}`;
    if (summaryPayout) summaryPayout.textContent = format(value - fee);
  };
  priceInput?.addEventListener('input', updateSummary);
  document.getElementById('qty-minus')?.addEventListener('click', () => { if (quantity) quantity.textContent = String(Math.max(1, Number(quantity.textContent) - 1)); });
  document.getElementById('qty-plus')?.addEventListener('click', () => { if (quantity) quantity.textContent = String(Number(quantity.textContent) + 1); });
  document.querySelectorAll('.condition-btn, .lang-btn, .edition-btn').forEach((button) => button.addEventListener('click', () => {
    const group = button.classList.contains('condition-btn') ? '.condition-btn' : button.classList.contains('lang-btn') ? '.lang-btn' : '.edition-btn';
    document.querySelectorAll(group).forEach((item) => item.classList.remove('bg-primary-container', 'text-on-primary-container', 'bg-surface-container-high', 'text-on-surface', 'font-semibold'));
    button.classList.add('bg-primary-container', 'text-on-primary-container', 'font-semibold');
  }));
  document.getElementById('btn-list-card')?.addEventListener('click', () => {
    const name = document.getElementById('card-name-input')?.value.trim();
    if (!name) return;
    alert(`Listing saved for ${name}. This is a prototype—no listing has been published.`);
  });
  updateSummary();
})();
