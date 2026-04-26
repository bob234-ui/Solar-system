import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import rickMortyApp from './hw3/rickmorty-app/app.js';
const planets = (await import('npm-solarsystem')).default;

const app = express();
const PORT = process.env.PORT || 3000;
const PIXABAY_KEY = process.env.PIXABAY_KEY || '5589438-47a0bca778bf23fc2e8c5bf3e';
const NASA_API_KEY = process.env.NASA_API_KEY || '9mUzIkhlZCZaOoMfspg7jMmwZCZ4LiRHtkgkambD';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));

app.use('/rickmorty', rickMortyApp);

app.get('/', async (req, res) => {
    const randomIndex = Math.floor(Math.random() * 50);
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&per_page=50&orientation=horizontal&q=solar system`;
    const response = await fetch(url);
    const data = await response.json();
    const randomImgURL = data.hits[randomIndex]?.largeImageURL || '';
    res.render('home.ejs', { randomImgURL });
});

app.get('/planetInfo', (req, res) => {
    const planet = req.query.planet;
    const planetInfo = planets[`get${planet}`]();
    res.render('planet.ejs', { planetInfo, planet });
});

app.get('/nasaPod', async (req, res) => {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.render('nasaPod.ejs', { data });
});

app.get('/Asteroids', (req, res) => {
    const planetInfo = planets.getAsteroids();
    res.render('asteroids.ejs', { planetInfo });
});

app.get('/Comets', (req, res) => {
    const planetInfo = planets.getComets();
    res.render('comets.ejs', { planetInfo });
});

app.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});
