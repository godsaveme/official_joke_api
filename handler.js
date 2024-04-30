const jokes = require('./jokes/index.json');

let lastJokeId = 0;
jokes.forEach(jk => { 
  jk.id = ++lastJokeId;
  jk.rating = Math.floor(Math.random() * 6);
});

const randomJoke = () => {
  return jokes[Math.floor(Math.random() * jokes.length)];
}

/**
 * Get N random jokes from a jokeArray
 */
const randomN = (jokeArray, n) => {
  const limit = jokeArray.length < n ? jokeArray.length : n;
  const randomIndicesSet = new Set();

  while (randomIndicesSet.size < limit) {
    const randomIndex = Math.floor(Math.random() * jokeArray.length);
    if (!randomIndicesSet.has(randomIndex)) {
      randomIndicesSet.add(randomIndex);
    }
  }

  return Array.from(randomIndicesSet).map(randomIndex => {
    return jokeArray[randomIndex];
  });
};

const randomTen = () => randomN(jokes, 10);

const randomSelect = (number) => randomN(jokes, number);

const jokeByType = (type, n) => {
  return randomN(jokes.filter(joke => joke.type === type), n);
};

/** 
 * @param {Number} id - joke id
 * @returns a single joke object or undefined
 */
const jokeById = (id) => (jokes.filter(jk => jk.id === id)[0]);

const jokesPagination = (page, limit) => {
    return {
      total: jokes.length,
      jokesPageArr: jokes.slice((page - 1) * limit, page * limit)
    }
}

const ratingUpdate = (id, rating) => {
  const joke = jokeById(+id)
  joke.rating = +rating;
  return joke;
}

const jokeSorting = (type, order) => {
  if(type == 'rating'){
    if(order == 'asc'){
      return jokes.sort(numericSortingAsc);
    } else if(order == 'desc'){
      return jokes.sort(numericSortingDes);
    }
  }
}

const jokeDefaultSorting = () => {
  jokes.sort(jokesDefaultSorting);
}

const jokeSave = (joke) => {
    const jokesLength = jokes.length;
    joke.id = jokesLength + 1;
    const newLength = jokes.push(joke);
    if(newLength > 0) return joke;
}

// sorting functions
const numericSortingAsc = (a, b) => a.rating - b.rating;

const numericSortingDes = (a, b) => b.rating - a.rating;

const jokesDefaultSorting = (a, b) => a.id - b.id;

module.exports = { jokes, randomJoke, randomN, randomTen, randomSelect, jokeById, jokeByType, jokesPagination, ratingUpdate, jokeSorting, jokeDefaultSorting, jokeSave };
