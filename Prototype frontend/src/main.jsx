import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import parse from 'html-react-parser';
import sourceHome from './legacy/index.html?raw';
import './legacy/welcome.css';
import './legacy/welcome-images.css';
import './legacy/welcome-layout.css';
import './legacy/welcome-cards.css';
import './legacy/welcome-title.css';

const homeScripts = [
  'demo-market.js',
  'home-game-theme.js', 'yugioh-banner.js', 'pokemon-banner.js',
  'dragon-card-tilt.js', 'marketplace-header.js', 'stitch-nav.js', 'stitch-home.js',
];

function Welcome() {
  const [preview, setPreview] = useState('none');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.dataset.game = 'none';
    document.body.className = '';
    document.title = 'TCG Market — Choose your game';
  }, []);

  const chooseGame = (game) => { window.location.href = `/?game=${encodeURIComponent(game)}`; };
  return <>
    <header className="app-header" hidden>
      <a className="brand" href="/" aria-label="TCG Market home"><span>✦</span> TCG Market</a>
      <div className="header-right"><span className="collection-label">Your collection</span><div className="switcher">
        <button id="switch-trigger" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span className="game-dot"/><span id="switch-label">Pokémon</span><b>⌄</b></button>
        {menuOpen && <div id="switch-menu" className="switch-menu"><button onClick={() => chooseGame('pokemon')}>● Pokémon</button><button onClick={() => chooseGame('yugioh')}>◇ Yu-Gi-Oh!</button></div>}
      </div></div>
    </header>
    <main>
      <section className="welcome" id="welcome-screen" data-preview={preview} aria-labelledby="welcome-title">
        <div className="ambient ambient-left"/><div className="ambient ambient-right"/>
        <div className="welcome-inner">
          <div className="intro"><p className="eyebrow">Interactive marketplace prototype</p><h1 id="welcome-title">Choose your <em>universe.</em></h1><p>Explore the card market, try the collection tools, and switch worlds whenever you want.</p></div>
          <div className="choice-grid" role="group" aria-label="Choose your card game">
            <button className="game-choice pokemon-choice" type="button" aria-label="Choose Pokémon" onMouseEnter={() => setPreview('pokemon')} onMouseLeave={() => setPreview('none')} onFocus={() => setPreview('pokemon')} onBlur={() => setPreview('none')} onClick={() => chooseGame('pokemon')}><span className="choice-art"><img className="game-logo pokemon-logo" src="./assets/pokemon-tcg-logo.webp" alt=""/><span className="sparkle s-one">✦</span><span className="sparkle s-two">✦</span></span><span className="choice-copy"><span className="choice-index">01 · CARD UNIVERSE</span><strong>Pokémon</strong><small>Chase favourites, track prices, and build your collection.</small></span><span className="choice-arrow" aria-hidden="true">→</span></button>
            <button className="game-choice yugioh-choice" type="button" aria-label="Choose Yu-Gi-Oh!" onMouseEnter={() => setPreview('yugioh')} onMouseLeave={() => setPreview('none')} onFocus={() => setPreview('yugioh')} onBlur={() => setPreview('none')} onClick={() => chooseGame('yugioh')}><span className="choice-art"><img className="game-logo yugioh-logo" src="./assets/yugioh-logo.svg" alt=""/><span className="glyph g-one">𓂀</span><span className="glyph g-two">✧</span></span><span className="choice-copy"><span className="choice-index">02 · CARD UNIVERSE</span><strong>Yu-Gi-Oh!</strong><small>Explore iconic monsters, staples, and competitive finds.</small></span><span className="choice-arrow" aria-hidden="true">→</span></button>
          </div>
          <p className="choice-help">Hover a world to preview it · Your choice is saved on this device</p>
        </div>
      </section>
    </main>
  </>;
}

function MarketHome({ game }) {
  const markup = useMemo(() => {
    const doc = new DOMParser().parseFromString(sourceHome, 'text/html');
    // React owns this view's mount and lifecycle. The original page body is kept
    // intact to preserve its detailed card layout and animation hook targets.
    doc.querySelectorAll('script').forEach((script) => script.remove());
    return doc.body.innerHTML;
  }, []);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.body.className = 'bg-surface font-body-md text-on-surface antialiased';
    document.body.dataset.game = game;
    document.title = `TCG Market — ${game === 'yugioh' ? 'Yu-Gi-Oh!' : 'Pokémon'}`;
    // The original index route removes this intro because the shared header
    // supplies its own search bar below the navigation.
    document.querySelector('main > div.flex.flex-col > section.w-full.px-margin-desktop.py-space-xl')?.remove();
    let cancelled = false;
    let current;
    const loadNext = (index) => {
      if (cancelled || index >= homeScripts.length) return;
      current = document.createElement('script');
      current.src = `./${homeScripts[index]}`;
      current.type = 'module';
      current.onload = () => loadNext(index + 1);
      current.onerror = () => loadNext(index + 1);
      document.body.append(current);
    };
    loadNext(0);
    return () => {
      cancelled = true;
      current?.remove();
      document.body.classList.remove('game-yugioh', 'game-pokemon', 'market-search-below');
      document.documentElement.classList.remove('dark');
    };
  }, [game]);

  return <div className="react-market-home">{parse(markup)}</div>;
}

function App() {
  const params = new URLSearchParams(window.location.search);
  const game = params.get('game');
  return game === 'pokemon' || game === 'yugioh' ? <MarketHome key={game} game={game}/> : <Welcome/>;
}

createRoot(document.getElementById('root')).render(<App/>);
