const express = require("express");
const axios = require("axios");
const Chance = require("chance");
const path = require("path");

const app = express();
const chance = new Chance();
const basePath = "/rickmorty";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.basePath = basePath;
  next();
});

const API = "https://rickandmortyapi.com/api";

app.get("/", async (req, res) => {
  try {
    const [charRes, epRes, locRes] = await Promise.all([
      axios.get(`${API}/character`),
      axios.get(`${API}/episode`),
      axios.get(`${API}/location`),
    ]);
    const stats = {
      characters: charRes.data.info.count,
      episodes: epRes.data.info.count,
      locations: locRes.data.info.count,
    };

    const mood = chance.pickone([
      "Wubba lubba dub dub!",
      "Get schwifty!",
      "I'm Pickle Riiick!",
      "Nobody exists on purpose.",
      "To live is to risk it all.",
      "Existence is pain.",
      "Ricky ticky tavi, beyotch!",
    ]);
    const funFact = `Fun fact: if you named ${chance.integer({ min: 1, max: 999 })} Ricks, ${chance.first()} would probably be the most common alias.`;
    res.render("home", { stats, mood, funFact });
  } catch (err) {
    res.status(500).render("error", { message: err.message });
  }
});

app.get("/characters", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const status = req.query.status || "";
    const name = req.query.name || "";
    const url = `${API}/character?page=${page}&status=${status}&name=${name}`;
    const { data } = await axios.get(url);

    const characters = data.results.map((c) => ({
      ...c,
      dimensionRating: chance.integer({ min: 1, max: 100 }),
      quirk: chance.pickone([
        "loves portal guns",
        "hates Morty",
        "collects Szechuan sauce",
        "runs a microverse",
        "fears the Citadel",
        "drives a flying car",
      ]),
    }));

    res.render("characters", {
      characters,
      info: data.info,
      page,
      status,
      name,
    });
  } catch (err) {
    res.status(500).render("error", { message: err.message });
  }
});

app.get("/characters/:id", async (req, res) => {
  try {
    const { data: character } = await axios.get(
      `${API}/character/${req.params.id}`
    );
    const epIds = character.episode.map((url) => url.split("/").pop());
    const epRes = await axios.get(`${API}/episode/${epIds.slice(0, 10).join(",")}`);
    const episodes = Array.isArray(epRes.data) ? epRes.data : [epRes.data];

    const backstory = `${character.name} once ${chance.pickone([
      "outsmarted the Council of Ricks",
      "accidentally merged two dimensions",
      "won a bet against the Devil",
      "built a robot out of pure spite",
      "unionized a hive-mind species",
    ])} and has been ${chance.pickone([
      "on the run ever since",
      "celebrated across the galaxy",
      "wanted in 12 dimensions",
      "completely unaware of the consequences",
    ])}.`;

    res.render("character-detail", { character, episodes, backstory });
  } catch (err) {
    res.status(500).render("error", { message: err.message });
  }
});

app.get("/episodes", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const { data } = await axios.get(`${API}/episode?page=${page}`);

    const episodes = data.results.map((ep) => ({
      ...ep,
      rating: chance.floating({ min: 6.5, max: 10, fixed: 1 }),
      reviewSnippet: `"${chance.sentence({ words: chance.integer({ min: 6, max: 10 }) })}" — ${chance.name()}`,
    }));

    res.render("episodes", { episodes, info: data.info, page });
  } catch (err) {
    res.status(500).render("error", { message: err.message });
  }
});

app.get("/locations", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const { data } = await axios.get(`${API}/location?page=${page}`);

    const locations = data.results.map((loc) => ({
      ...loc,
      population: chance.integer({ min: 100, max: 9000000000 }).toLocaleString(),
      threatLevel: chance.pickone(["Low", "Moderate", "High", "Extreme", "Cronenberg-level"]),
      dangerColor: { Low: "#4caf50", Moderate: "#ff9800", High: "#f44336", Extreme: "#9c27b0", "Cronenberg-level": "#000" },
    }));

    res.render("locations", { locations, info: data.info, page });
  } catch (err) {
    res.status(500).render("error", { message: err.message });
  }
});

app.get("/random", async (req, res) => {
  try {
    const { data: info } = await axios.get(`${API}/character`);
    const randomId = chance.integer({ min: 1, max: info.info.count });
    res.redirect(`${basePath}/characters/${randomId}`);
  } catch (err) {
    res.status(500).render("error", { message: err.message });
  }
});

app.use((req, res) => {
  res.status(404).render("error", { message: "Page not found in this dimension." });
});

module.exports = app;
