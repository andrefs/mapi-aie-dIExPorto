const Promise = require('bluebird');
const {mongoose,Article} = require('./db');
const runGazetteers = require('./gazetteers');
const rules = require('./rules');

const extractRelations = () => {
  const query  = {'nlp.status':'success'};

  return Article.count(query).then(total => {
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
        runGazetteers(articles).forEach(a => {
          a.nlp.freeling.sentences.forEach(s => {
            let matched = [];
            Object.values(rules).forEach(r => {
              const _m = r.matchOrdered(s.tokens, {url: a.url})
              matched.push(..._m);
            });
            allMatched.push(...matched);
          });
        });
      });
    })
    .then(() => {
      console.log('Extracted', allMatched.length, 'relations');
      return allMatched;
    });
  });
};

module.exports = extractRelations;


