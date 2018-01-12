
const Promise = require('bluebird');
const parser = Promise.promisifyAll(require('rss-parser'));
const {mongoose,Article} = require('./lib/db');

mongoose.connect('mongodb://localhost/aie_develop');

const sources = {
  futebol365: {
    rssUrl: 'http://feeds.feedburner.com/futebol365/noticias?format=xml',
  },
  maisfutebol: {
    rssUrl: 'http://www.zerozero.pt/rss/noticias.php',
  },
  zerozero: {
    rssUrl: 'http://www.maisfutebol.iol.pt/rss.xml'
  }
};


const getArticlesFromRss = (source, rssUrl) => {
  return parser.parseURLAsync(rssUrl)
    .then(parsed => {
      const timestamp = new Date();
      let articles = [];
      parsed.feed.entries.forEach(e => articles.push({
        url: e.link || e.guid,
        source,
        pubDate: new Date(e.pubDate),
        title: e.title,
        crawl: {
          timestamp
        }
      }));
      return articles;
    });
};

const crawlRss = (source, rssUrl) => {
  return getArticlesFromRss(source, rssUrl)
    .then(articles => {
      console.info('Saving',articles.length,'articles from',source);
      return Article.create(articles);
    })
    .then(created => {
      console.info('\tcreated:', created);
      return created;
    })
    .catch(failed => console.warn('\tfailed',failed));
};

const crawlAllRss = (sources) => {
  let promises = [];
  Object.keys(sources).forEach(s => {
    promises.push(crawlRss(s, sources[s].rssUrl));
  });
  return Promise.all(promises);
}

crawlAllRss(sources)
  .then(x => { console.log('XXXXXXXX 8', x); })
  .finally(() => mongoose.disconnect());

