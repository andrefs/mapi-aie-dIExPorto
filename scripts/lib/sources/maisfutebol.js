const {URL} = require('url');
const md5 = require('md5');
const cheerio = require('cheerio');

module.exports = {
  slug: 'maisfutebol',
  rssUrl: 'http://www.maisfutebol.iol.pt/rss.xml',
  urlTag: 'link',
  getOrigId: a => {
    const url = new URL(a.url);
    url.pathname.match(/\/([\w-]+)$/);
    return md5(RegExp.$1);
  }
};
