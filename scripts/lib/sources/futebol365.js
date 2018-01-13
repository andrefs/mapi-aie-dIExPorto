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
  },
  parseHtml: (html, article) => {
    const $ = cheerio.load(html);
    const lead = $('.detalheNoticia .texto span.negrito').text();
    const body = $('.detalheNoticia .texto p')
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