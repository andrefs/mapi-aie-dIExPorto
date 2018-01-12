
const Promise = require('bluebird');
const {mongoose,Article} = require('./lib/db');
const {URL} = require('url');
const util = require('util');

mongoose.connect('mongodb://localhost/aie_develop');

let currentRequests = {};

const curReqsToString = () => {
  //console.log('\033c')
  const domains = Object.keys(currentRequests).sort();

  domains.forEach(d => {
    console.log(d);
    const articles = Object.values(currentRequests[d]);
    articles.forEach(a => console.log('\t'+a.url));
  });
}

const getCrawledArticles = () => {
  const query = {
    $or: [
      {fetch: {$exists: false}},
      {'fetch.status': {
        $nin: ['fail','success']}
      }
    ]
  };
  return Article.find(query).limit(80).lean().exec();
}

const splitByDomain = (articles) => {
  let domains = {};
  articles.forEach(a => {
    const url = new URL(a.url);
    domains[url.host] = domains[url.host] || [];
    domains[url.host].push(a);
  });
  return domains;
}

const fetchArticlesWithDelay = (articles, duration) => {
  return Promise.mapSeries(articles, a => {
    return getArticleData(a)
      //.then(() => console.log('Fetched article', a.url))
      .then(delay(duration))
  });
}

const getArticleData = article => {
  pushToCurReqs(article, currentRequests);
  curReqsToString();
  const duration = Math.floor(Math.random()*4000)+1;
  return Promise.resolve({cenas:'coiso'})
    .then(delay(duration))
    .then(x => {
      popFromCurReqs(article, currentRequests);
      curReqsToString();
      return x;
    });
}

const pushToCurReqs = (article, curReqs) => {
  const domain = new URL(article.url).host;
  curReqs[domain] = curReqs[domain] || {};
  curReqs[domain][article.origId] = article;
}

const popFromCurReqs = (article, curReqs) => {
  const domain = new URL(article.url).host;
  curReqs[domain] = curReqs[domain] || {};
  delete curReqs[domain][article.origId];
}


getCrawledArticles()
  .then(splitByDomain)
  .then(domains => {
    const promises = Object.values(domains).map(d => fetchArticlesWithDelay(d, 5000));
    return Promise.all(promises);
  })
  //.then(console.log);

const delay = time => (result) => new Promise(resolve => setTimeout(() => resolve(result), time));
