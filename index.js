const express = require('express');
const bodyParser = require('body-parser')
const LimitingMiddleware = require('limiting-middleware');
const { randomJoke, randomTen, randomSelect, jokeByType, jokeById, jokesPagination, ratingUpdate, jokeSorting, jokeDefaultSorting, jokeSave } = require('./handler');

const app = express();

app.use(new LimitingMiddleware().limitByIp());

app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

app.get('/', (req, res) => {
  res.send('Try /random_joke, /random_ten, /jokes/random, or /jokes/ten');
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get('/random_joke', (req, res) => {
  res.json(randomJoke());
});

app.get('/random_ten', (req, res) => {
  res.json(randomTen());
});

app.get('/jokes/random', (req, res) => {
  res.json(randomJoke());
});

// TODO: Needs fixing
app.get("/jokes/random(/*)?", (req, res) => {
  let num;

  try {
    num = parseInt(req.path.substring(14, req.path.length));
  } catch (err) {
    res.send("The passed path is not a number.");
  } finally {
    const count = Object.keys(jokes).length;

    if (num > Object.keys(jokes).length) {
      res.send(`The passed path exceeds the number of jokes (${count}).`);
    } else {
      res.json(randomSelect(num));
    }
  }
});

app.get('/jokes/ten', (req, res) => {
  res.json(randomTen());
});

app.get('/jokes/:type/random', (req, res) => {
  res.json(jokeByType(req.params.type, 1));
});

app.get('/jokes/:type/ten', (req, res) => {
  res.json(jokeByType(req.params.type, 10));
});



/**
 * @description endpoint to get joke by id
 * @param {Number} id - joke id
 */

app.get('/jokes/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const joke = jokeById(+id);
    if (!joke) return next({ statusCode: 404, message: 'joke not found' });
    return res.json(joke);
  } catch (e) {
    return next(e);
  }
});



/**
 * @description endpoint for pagination and sorting jokes
 * @param {Number} page - page number 
 * @param {Number} limit - number of jokes per page
 * @param {String} type - sorting type
 * @param {String} order - sorting order (asc, desc)
 */

app.get('/jokes', (req, res, next) => {
  try{
    const { page, limit, type, order } = req.query;
    jokeDefaultSorting();

    if(type && order) jokeSorting(type, order);
    
    const jokesPaginationArr = jokesPagination(page, limit);
    if(!jokesPaginationArr) return next({ statusCode:409, message: 'joke pagination incorrect' });
    return res.json(jokesPaginationArr);
  } catch (e) {
    return next(e);
  }
});


/**
 * @description endpoint to update joke rating
 * @param {Number} id - joke id
 * @param {String} rating - joke rating
 */

app.get('/joke/rating/update', (req, res, next) => {
  try{
    const { id, rating } = req.query;
    const updatedJoke = ratingUpdate(id, rating);
    if(!updatedJoke) return next({ statusCode:409, message: 'joke updated error' });
    return res.json(updatedJoke);
  } catch (e) {
    return next(e);
  }
});



/**
 * @description endpoint to create a joke
 * @param {Joke} joke - joke text
 */

app.post('/joke/create', (req, res, next) => {
  try{
    const { joke } = req.body;
    if(!joke) return next({ statusCode:409, message: 'joke not found' });
    const jokeSaved = jokeSave(joke);
    return res.json(jokeSaved);
  } catch (e) {
    return next(e);
  }
});



app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    type: 'error', message: err.message
  });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`listening on ${PORT}`));
