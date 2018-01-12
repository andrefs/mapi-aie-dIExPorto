const Promise = require('bluebird');
const {mongoose,Article} = require('./lib/db');
const {URL} = require('url');
const util = require('util');
const rp   = require('request-promise');
const sources = require('./lib/sources');
mongoose.set('debug', true);

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
  return Article.find(query).limit(80).exec();
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
      .then(() => console.log('Fetched article', a.url))
      .then(delay(duration))
  });
}

const getArticleData = article => {
  const source = sources[article.source];
  pushToCurReqs(article, currentRequests);
  //curReqsToString();

  return rp(article.url)
    .then(html => {
      popFromCurReqs(article, currentRequests);
      //curReqsToString();

      return source.parseHtml(html, article);
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
    const promises = Object.values(domains).map(d => fetchArticlesWithDelay(d, 5000)); // FIXME duration should come from source profile
    return Promise.all(promises);
  })
  //.then(console.log);

const delay = time => (result) => new Promise(resolve => setTimeout(() => resolve(result), time));
