const Promise = require('bluebird');
const {mongoose,Article} = require('./lib/db');
const {URL} = require('url');
const util = require('util');
const rp   = require('request-promise');
const sources = require('./lib/sources');
const runGazetteers = require('./lib/gazetteers');
const RelExRule = require('./lib/rel-ex-rule');

mongoose.connect('mongodb://localhost/aie_develop');
const query  = {'nlp.status':'success'};

const rule = new RelExRule([
      {tag: 'NP00O00'},
      {pos: 'verb', lemma: 'emprestar', person: 3},
      {tag: 'NP00SP0'},
      {tag: 'NP00O00'}
], (matched, context) => {
  console.log('Matched ('+context.sId+')', context.url);
  console.log('\t'+matched.map(x => x.token.form).join(' ')+'\n');
});

Article.count(query).then(total => {
  console.log('Total articles:', total);
  const limit = 100;
  let promises = [];
  const iters = Math.ceil(total/limit);
  for(let i=0; i<iters; i++){
    promises.push(() => Article.find(query).select('origId url nlp').skip(i*limit).limit(limit).lean().exec());
  }

  console.log('Searching for matched for rule:');
  console.log(JSON.stringify(rule));

  return Promise.each(promises, getArticles => {
    return getArticles().then(articles => {
      matchRule(rule, articles);
    });
  })
  .then(() => { mongoose.disconnect(); });
});


const matchRule = (rule, articles) => {
  runGazetteers(articles).forEach(a => {
    a.nlp.freeling.sentences.forEach(s => {
      rule.matchOrdered(s.tokens, {url: a.url, sId: s.id});
    });
  });
};

