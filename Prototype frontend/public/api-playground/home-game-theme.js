const selectedGame = new URLSearchParams(window.location.search).get('game');

if (selectedGame === 'yugioh') {
  document.body.classList.add('game-yugioh');
  const gameTheme = document.createElement('style');
  gameTheme.textContent = `
    body.game-yugioh > header {
      background-color: #050505 !important;
      background-image: none !important;
      border-bottom-color: #252525 !important;
    }
    body.game-yugioh > header .text-on-surface { text-shadow: 0 1px 8px rgba(0, 0, 0, .85); }
  `;
  document.head.append(gameTheme);
}
