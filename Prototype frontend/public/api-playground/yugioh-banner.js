if(new URLSearchParams(window.location.search).get('game')==='yugioh'){
  document.body.classList.add('game-yugioh');
  const card=(position,label,id,price)=>`<a class="dragon-card-demo ygo-banner-card ygo-banner-card--${position}" data-card-id="${id}" href="./card.html?game=yugioh&id=${id}" aria-label="View offers for ${label}, from ${price}"><span class="dragon-card-demo__tilt"><span class="dragon-card-demo__face dragon-card-demo__front"><img src="./assets/stardust-dragon-back.png" alt="Yu-Gi-Oh! card back loading placeholder"><i class="dragon-card-demo__shine"></i></span></span><span class="ygo-card-market-info"><span class="ygo-card-market-info__name">${label}</span><span class="ygo-card-market-info__price">From ${price}</span></span></a>`;
  const banner=document.createElement('section');
  banner.className='ygo-intro-banner';
  banner.setAttribute('aria-label','Yu-Gi-Oh! featured banner');
  banner.innerHTML=`<img class="ygo-intro-banner__character" src="./assets/yugioh-yugi.webp" alt=""><div class="ygo-intro-banner__panel" aria-label="Featured content area"><div class="ygo-banner-card-heading"><p class="ygo-banner-card-title">Featured this week</p></div>${card('left','Stardust Dragon','44508094','$12.90')}${card('center','The Dragon that Devours the Dogma','76666602','$1.25')}${card('right','Dark Magician','46986414','$5.80')}</div>`;
  document.querySelector('header').insertAdjacentElement('afterend',banner);
  banner.querySelectorAll('.ygo-banner-card').forEach((cardPreview)=>{
    const image=cardPreview.querySelector('img');
    fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${cardPreview.dataset.cardId}`)
      .then((response)=>{if(!response.ok)throw new Error('Card request failed');return response.json()})
      .then((payload)=>{const card=payload.data?.[0];const imageUrl=card?.card_images?.[0]?.image_url;const cardmarketPrice=card?.card_prices?.[0]?.cardmarket_price;if(imageUrl){image.src=imageUrl;image.alt=card.name;cardPreview.querySelector('.ygo-card-market-info__name').textContent=card.name}if(cardmarketPrice)cardPreview.querySelector('.ygo-card-market-info__price').textContent=`Cardmarket · €${cardmarketPrice}`})
      .catch(()=>{});
  });
  ['dragon-card.css','dragon-card-fix.css','yugioh-banner.css','yugioh-banner-card.css','yugioh-banner-card-tilt.css'].forEach((href)=>{const link=document.createElement('link');link.rel='stylesheet';link.href=`./${href}`;document.head.append(link)});
}
