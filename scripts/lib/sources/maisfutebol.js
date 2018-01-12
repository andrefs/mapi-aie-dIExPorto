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
  },
  parseHtml: (html, article) => {
    const $ = cheerio.load(html);
    const lead = $('.topoArtigo h2').text();
    const body = $('.articleBody p')
      .map((i,p) => $(p).text())
      .get()
      .join('\n');
    article.fetch = {
      firstDate: new Date(),
      lead,
      status: 'success',
      text: body,
    };
    return article.save();
  }
};
