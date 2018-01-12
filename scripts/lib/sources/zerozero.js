const {URL} = require('url');
const cheerio = require('cheerio');

module.exports = {
  slug: 'zerozero',
  rssUrl: 'http://www.zerozero.pt/rss/noticias.php',
  urlTag: 'link',
  getOrigId: a =>{
    const url = new URL(a.url);
    return url.searchParams.get('id');
  },
  parseHtml: (html, article) => {
    const $ = cheerio.load(html);
    const body = $('#news_body .text p')
      .map((i,p) => $(p).text())
      .get()
      .join('\n');
    article.fetch = {
      html,
      body,
      status: 'success',
      firstDate: new Date(),
    };
    return article.save();
  }
};
