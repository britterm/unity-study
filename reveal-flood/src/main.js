import Reveal from "reveal.js";
import Notes from "reveal.js/plugin/notes/notes.esm.js";
import Markdown from "reveal.js/plugin/markdown/markdown.esm.js";
import "reveal.js/dist/reveal.css";
import "reveal.js/dist/theme/white.css";
import "./styles.css";

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
