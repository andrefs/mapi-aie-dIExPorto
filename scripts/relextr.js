const Promise = require('bluebird');
const {mongoose,Article} = require('./lib/db');
const {URL} = require('url');
const util = require('util');
const rp   = require('request-promise');
const sources = require('./lib/sources');
const runGazetteers = require('./lib/gazetteers');
const rules = require('./lib/rules');

mongoose.connect('mongodb://localhost/aie_develop');

const query  = {'nlp.status':'success'};
//const query  = {url: 'http://www.maisfutebol.iol.pt/liga/vitoria-setubal/fc-porto-andre-pereira-a-caminho-de-setubal'};

Article.count(query).then(total => {
  console.log('Extracting relationships from',total,'articles');
  const limit = 100;
  let promises = [];
  const iters = Math.ceil(total/limit);
  for(let i=0; i<iters; i++){
    promises.push(() => Article.find(query).select('origId url nlp title fetch.lead fetch.text').skip(i*limit).limit(limit).lean().exec());
  }

  let allMatched = [];

  return Promise.each(promises, getArticles => {
    return getArticles().then(articles => {
      articles.forEach(a => {
        a.nlp.freeling.sentences.forEach(s => {
          const matched = Object.values(rules).map(r => r.matchOrdered(s.tokens)).filter(x => !!x);
          allMatched.push(...matched);
        });
      });
    });
  })
  .then(() => {
    console.log('XXXXXXXXx 9\n', allMatched.join('\n'));
    mongoose.disconnect();
  });
});

