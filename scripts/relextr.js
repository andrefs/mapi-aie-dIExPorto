const Promise = require('bluebird');
const {mongoose,Article} = require('./lib/db');
const {URL} = require('url');
const util = require('util');
const rp   = require('request-promise');
const sources = require('./lib/sources');
const runGazetteers = require('./lib/gazetteers');
const RelExRule = require('./lib/rel-ex-rule');

mongoose.connect('mongodb://localhost/aie_develop');

let currentRequests = {};

const getAllArticles = () => {
  const query  = {'nlp.status':'success'};
  //const query  = {url: 'http://www.maisfutebol.iol.pt/liga/vitoria-setubal/fc-porto-andre-pereira-a-caminho-de-setubal'};
  const fields = 'nlp title url origId fetch.lead fetch.text';

  return Article.find(query).select(fields).limit(1000).lean().exec();
}

// const emprestimoRule = {
//   scope: 'sentence',
//   rule: {
//     ordered: [
//       {tag: 'NP00O00'},
//       {pos: 'verb', '$or':[{lemma: 'emprestar'},{lemma: 'ceder'}]},
//       {tag: 'NP00SP0'},
//       //{tag: 'NP00O00'},
//       {'$or':[
//         {tag: 'NP00SP0'},
//         {tag: 'NP00O00'}]
//       }
//     ]
//   }
// };

const emprestimoRule = new RelExRule([
  {tag: 'NP00O00'},
  {pos: 'verb', lemma: 'emprestar', person: 3},
  {tag: 'NP00SP0'},
  {tag: 'NP00O00'}
]);

const arbitroRule = new RelExRule([
  {tag: 'NP00SP0'},
  {lemma:'criticar'},
  {lemma:'arbitragem'},
]);

getAllArticles()
  .then(articles => Promise.resolve(runGazetteers(articles)))
  .then(articles => {
    articles.forEach(a => {
      a.nlp.freeling.sentences.forEach(s => {
        if(emprestimoRule.matchOrdered(s.tokens)){
          console.log('XXXXXXXXXx 8', s.id, a.url);
        } else {
          //console.log('XXXXXXXXXx 9');
        }
      });
    });
    console.log('XXXXXXXXXX 99 finished');
    mongoose.disconnect();
  });
