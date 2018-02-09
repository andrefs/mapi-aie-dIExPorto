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
  fetchCooldown: 5000,
  parseHtml: (html, article) => {
    if(article.title && article.title.match(/^VÍDEO/)){
      console.log('Video in', article.url);
      article.fetch = {
        html,
        firstDate: new Date(),
        status: 'fail',
      };
      return article.save();
    }
    const $ = cheerio.load(html);
    const lead = $('.topoArtigo h2').text();
    const body = $('.articleBody p')
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
