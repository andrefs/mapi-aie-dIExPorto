
const Promise = require('bluebird');
const Parser = require('rss-parser');
const parser = Promise.promisifyAll(new Parser());
const {mongoose,Article} = require('./lib/db');
const md5 = require('md5');
const {URL} = require('url');

mongoose.connect('mongodb://localhost/aie_develop');

const sources = {
  futebol365: {
    slug: 'futebol365',
    rssUrl: 'http://feeds.feedburner.com/futebol365/noticias?format=xml',
    urlTag: 'guid',
    getOrigId: a => {
      const url = new URL(a.url);
      url.pathname.match(/^\/artigo\/(\d+)/);
      return RegExp.$1;
    }
  },
  maisfutebol: {
    slug: 'maisfutebol',
    rssUrl: 'http://www.maisfutebol.iol.pt/rss.xml',
    urlTag: 'link',
    getOrigId: a => {
      const url = new URL(a.url);
      url.pathname.match(/\/([\w-]+)$/);
      return md5(RegExp.$1);
    }
  },
  zerozero: {
    slug: 'zerozero',
    rssUrl: 'http://www.zerozero.pt/rss/noticias.php',
    urlTag: 'link',
    getOrigId: a =>{
      const url = new URL(a.url);
      return url.searchParams.get('id');
    }
  }
};


const getArticlesFromRss = source => {
  return parser.parseURLAsync(source.rssUrl)
    .then(feed => {
      const timestamp = new Date();
      let articles = [];
      feed.items.forEach(e => {
        let article = {
          url: e[source.urlTag],
          source: source.slug,
          pubDate: new Date(e.pubDate),
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
      return createArticles(source, articles);
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

