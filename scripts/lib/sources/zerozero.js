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
  fetchCooldown: 15000,
  parseHtml: (html, article) => {
    const $ = cheerio.load(html);
    if($('.zztext').length > 0){ console.log('Recaptcha at', article.url); }

    const title = $('#news_body .title h1').text();
    const body = $('#news_body .text p')
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
    article.title = title;
    article.fetch = {
      html,
      text: body,
      status: 'success',
      firstDate: new Date(),
    };
    return article.save();
  }
};
