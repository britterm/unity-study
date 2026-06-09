import Reveal from "reveal.js";
import Notes from "reveal.js/plugin/notes/notes.esm.js";
import Markdown from "reveal.js/plugin/markdown/markdown.esm.js";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/white.css";
import "./styles.css";

const themes = [
  ["classic", "Classic"],
  ["atlas", "Atlas"],
  ["chapel", "Chapel"],
  ["seminar", "Seminar"],
  ["manuscript", "Manuscript"]
];

const themeStorageKey = "unity-deck-theme";
const validThemes = new Set(themes.map(([id]) => id));
const params = new URLSearchParams(window.location.search);
const requestedTheme = params.get("theme");
const savedTheme = window.localStorage.getItem(themeStorageKey);
const initialTheme = validThemes.has(requestedTheme)
  ? requestedTheme
  : validThemes.has(savedTheme)
    ? savedTheme
    : "classic";

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(themeStorageKey, theme);

  document.querySelectorAll(".theme-switcher button").forEach((button) => {
    const isActive = button.dataset.theme === theme;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function createThemeSwitcher() {
  const switcher = document.createElement("nav");
  switcher.className = "theme-switcher";
  switcher.setAttribute("aria-label", "Visual theme");

  themes.forEach(([id, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.theme = id;
    button.textContent = label;
    button.title = `${label} visual theme`;
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => applyTheme(id));
    switcher.append(button);
  });

  document.body.append(switcher);
}

createThemeSwitcher();
applyTheme(initialTheme);

const deck = new Reveal({
  hash: true,
  slideNumber: "c/t",
  transition: "slide",
  backgroundTransition: "fade",
  margin: 0.05,
  width: 1440,
  height: 900,
  controlsTutorial: false,
  plugins: [Markdown, Notes]
});

window.UnityDeck = deck;
deck.initialize();
