(() => {
  const game = new URLSearchParams(location.search).get("game");
  function tab(name) {
    document
      .querySelectorAll("[data-tab]")
      .forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    document
      .querySelectorAll("[data-panel]")
      .forEach((p) => (p.hidden = p.id !== name));
  }
  document
    .querySelectorAll("[data-tab]")
    .forEach((b) => (b.onclick = () => tab(b.dataset.tab)));
  const saved = localStorage.getItem("cardcart-display-name");
  if (saved) {
    document.querySelector(".identity h1").textContent = saved;
    document.querySelector(".portrait").textContent = saved
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2);
  }
  document.querySelector(".profile-settings-link").href =
    `./settings.html?game=${encodeURIComponent(game)}`;
  document.querySelector("header input")?.addEventListener("keydown", (e) => {
    if (
      e.key === "Enter" &&
      !e.defaultPrevented &&
      e.currentTarget.value.trim()
    )
      location.href = `./search.html?${new URLSearchParams({ q: e.currentTarget.value.trim(), game })}`;
  });
})();
