const {URL} = require('url');
const cheerio = require('cheerio');

module.exports = {
  slug: 'futebol365',
  rssUrl: 'http://feeds.feedburner.com/futebol365/noticias?format=xml',
  urlTag: 'guid',
  getOrigId: a => {
    const url = new URL(a.url);
    url.pathname.match(/^\/artigo\/(\d+)/);
    return RegExp.$1;
  }
};
