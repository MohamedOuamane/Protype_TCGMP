document.querySelectorAll('.dragon-card-demo').forEach((dragonCard)=>{
  const setTilt=(event)=>{const rect=dragonCard.getBoundingClientRect();const x=(event.clientX-rect.left)/rect.width;const y=(event.clientY-rect.top)/rect.height;dragonCard.style.setProperty('--rotate-y',`${(x-.5)*18}deg`);dragonCard.style.setProperty('--rotate-x',`${(.5-y)*18}deg`);dragonCard.style.setProperty('--shine-x',`${x*100}%`);dragonCard.style.setProperty('--shine-y',`${y*100}%`)};
  const resetTilt=()=>{dragonCard.style.setProperty('--rotate-y','0deg');dragonCard.style.setProperty('--rotate-x','0deg');dragonCard.style.setProperty('--shine-x','50%');dragonCard.style.setProperty('--shine-y','50%')};
  dragonCard.addEventListener('pointermove',setTilt);dragonCard.addEventListener('pointerleave',resetTilt);dragonCard.addEventListener('click',()=>{const flipped=dragonCard.classList.toggle('is-flipped');dragonCard.setAttribute('aria-pressed',String(flipped))});
});
