const welcome = document.querySelector('#welcome-screen');
const gameCards = document.querySelectorAll('.choice-grid [data-game-choice]');

gameCards.forEach((card) => {
  const game = card.dataset.gameChoice;
  const showPreview = () => { welcome.dataset.preview = game; };
  const clearPreview = () => { welcome.dataset.preview = 'none'; };

  card.addEventListener('mouseenter', showPreview);
  card.addEventListener('focus', showPreview);
  card.addEventListener('mouseleave', clearPreview);
  card.addEventListener('blur', clearPreview);
  card.addEventListener('click', () => {
    window.location.href = `./index.html?game=${encodeURIComponent(game)}`;
  });
});
