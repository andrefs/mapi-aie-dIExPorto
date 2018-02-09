
const Promise = require('bluebird');
const parseXml = Promise.promisify(require('fast-feed').parse);
const {mongoose,Article} = require('../lib/db');
const sources = require('../lib/sources');
const rp = require('request-promise');

mongoose.connect('mongodb://localhost/aie_develop');

const getArticlesFromRss = source => {
  let options = source.crawlOptions || {};
  options.uri = source.rssUrl;

  return rp(options)
    .then(parseXml)
    .then(feed => {
      const timestamp = new Date();
      let articles = [];
      feed.items.forEach(e => {
        let article = {
          url: e[source.urlTag],
          source: source.slug,
          pubDate: new Date(e.date),
          title: e.title,
          crawl: {
            firstDate: timestamp
          }
        };
        article.origId = source.getOrigId(article);
        articles.push(article);
      });
      return articles;
    });
};

const crawlRss = source => {
  return getArticlesFromRss(source)
    .then(articles => {
      const relevantArticles = source.ignoreArticles ?
        articles.filter(source.ignoreArticles) :
        articles;
      return createArticles(source, relevantArticles);
    });
};

const crawlAllRss = (sources) => {
  let promises = [];
  Object.values(sources).forEach(s => {
    promises.push(crawlRss(s))
  });
  return Promise.all(promises);
}

crawlAllRss(sources)
  .finally(() => mongoose.disconnect());


const createArticles = (source, articles) => {
  const query = {
    origId: {$in: articles.map(a => a.origId)}
  };
  return Article.find(query).select('origId').lean().exec()
    .then(existingArticles => {
      const existingIds = existingArticles.map(a => a.origId);
      const newArticles  = articles.filter(a => !existingIds.includes(a.origId));
      console.info('Found',articles.length,'articles from',source.slug);
      if(!newArticles){
        console.log('  no new articles');
        return [];
      }
      else {
        console.log('  saving',newArticles.length,'new');
        return Article.create(newArticles);
      }
    });
};

