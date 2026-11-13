(() => {
  const game = new URLSearchParams(location.search).get("game");
  const settingsUrl = `./settings.html?game=${encodeURIComponent(game)}`;
  const profileUrl = `./profile.html?game=${encodeURIComponent(game)}`;
  document.querySelector(".settings-back").href = profileUrl;
  document.querySelectorAll('[data-path="user-profile"]').forEach((link) => {
    link.href = profileUrl;
  });
  const tabs = [...document.querySelectorAll("[data-settings-tab]")];
  const panels = [...document.querySelectorAll("[data-settings-panel]")];
  const activate = (name) => {
    tabs.forEach((tab) =>
      tab.setAttribute(
        "aria-selected",
        String(tab.dataset.settingsTab === name),
      ),
    );
    panels.forEach((panel) => {
      panel.hidden = panel.id !== `settings-${name}`;
    });
    history.replaceState(
      null,
      "",
      `${settingsUrl}&section=${encodeURIComponent(name)}`,
    );
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab.dataset.settingsTab));
    tab.addEventListener("keydown", (event) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      const nextIndex =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? tabs.length - 1
            : (index + (event.key === "ArrowDown" ? 1 : -1) + tabs.length) %
              tabs.length;
      tabs[nextIndex].focus();
      activate(tabs[nextIndex].dataset.settingsTab);
    });
  });
  const section = new URLSearchParams(location.search).get("section");
  if (tabs.some((tab) => tab.dataset.settingsTab === section))
    activate(section);
  const savedName = localStorage.getItem("cardcart-display-name");
  if (savedName) document.querySelector("#display-name").value = savedName;
  const saveForm = (formId, noteId, message, callback) =>
    document.querySelector(formId).addEventListener("submit", (event) => {
      event.preventDefault();
      callback?.();
      document.querySelector(noteId).textContent = message;
    });
  saveForm(
    "#account-settings-form",
    "#account-settings-note",
    "Preferences saved in this browser.",
    () =>
      localStorage.setItem(
        "cardcart-display-name",
        document.querySelector("#display-name").value.trim() || "Mohamed C.",
      ),
  );
  saveForm(
    "#seller-settings-form",
    "#seller-settings-note",
    "Seller settings saved in this browser.",
  );
  saveForm(
    "#notification-settings-form",
    "#notification-settings-note",
    "Notification preferences saved in this browser.",
  );
  document
    .querySelector("header input")
    ?.addEventListener("keydown", (event) => {
      if (
        event.key === "Enter" &&
        !event.defaultPrevented &&
        event.currentTarget.value.trim()
      )
        location.href = `./search.html?${new URLSearchParams({ q: event.currentTarget.value.trim(), game })}`;
    });
})();
