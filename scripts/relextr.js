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


// http://www.maisfutebol.iol.pt/mercado/transferencias/sporting-liam-jordan-na-dinamarca-por-emprestimo
//
const emprestimoRule = new RelExRule([
  {tag: 'NP00O00'},
  {pos: 'verb', lemma: 'emprestar', person: 3},
  {tag: 'NP00SP0'},
  {tag: 'NP00O00'}
]);

// http://www.futebol365.pt/artigo/183001-mercado-bayern-munique-esta-interessado-em-gelson-martins/
// http://www.maisfutebol.iol.pt/internacional/argentina/icardi-esta-a-ser-cobicado-pelo-real-madrid-diz-sampaoli
const interessadoRule = new RelExRule([
  [{tag: 'NP00O00'},{tag: 'NP00SP0'}],
  {form: 'interessado'}
]);

// -----------------------
//
const arbitroRule = new RelExRule([
  {tag: 'NP00SP0'},
  {lemma:'criticar'},
  {lemma:'arbitragem'},
]);


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

  return Promise.each(promises, getArticles => {
    return getArticles().then(articles => {
      articles.forEach(a => {
        a.nlp.freeling.sentences.forEach(s => {
          if(emprestimoRule.matchOrdered(s.tokens)){
            console.log('XXXXXXXXXx 8', s.id, a.url);
          } else {
            //console.log('XXXXXXXXXx 9');
          }
        });
      });
    });
  })
  .then(() => { mongoose.disconnect(); });
});

