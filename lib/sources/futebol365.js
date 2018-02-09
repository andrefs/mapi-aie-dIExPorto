const {URL} = require('url');
const cheerio = require('cheerio');

module.exports = {
  slug: 'futebol365',
  rssUrl: 'http://feeds.feedburner.com/futebol365/noticias?format=xml',
  urlTag: 'id',
  getOrigId: a => {
    const url = new URL(a.url);
    url.pathname.match(/^\/artigo\/(\d+)/);
    return RegExp.$1;
  },
  fetchCooldown: 5000,
  parseHtml: (html, article) => {
    const $ = cheerio.load(html);
    const lead = $('.detalheNoticia .texto span.negrito').text();
    const body = $('.detalheNoticia .texto p')
      .map((i,p) => $(p).text())
      .get()
      .join('\n');
    if(!body || body.length === 0 || body.match(/^\s+$/)){
      console.log('Empty body on article',article.url+', discarding...');
      article.fetch = {
        html,
        firstDate: new Date(),
        status: 'fail',
      };
      return article.save();
    }
    article.fetch = {
      html,
      firstDate: new Date(),
      lead,
      status: 'success',
      text: body,
    };
    return article.save();
  }
};
