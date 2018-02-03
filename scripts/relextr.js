const Promise = require('bluebird');
const {mongoose,Article} = require('./lib/db');
const {URL} = require('url');
const util = require('util');
const rp   = require('request-promise');
const sources = require('./lib/sources');
const runGazetteers = require('./lib/gazetteers');

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

const emprestimoRule = {
  scope: 'sentence',
  rule: {
    ordered: [
      {tag: 'NP00O00'},
      {pos: 'verb', lemma: 'emprestar', person: 3},
      {tag: 'NP00SP0'},
      {tag: 'NP00O00'}
    ]
  }
};

const arbitroRule = {
  rule: {
    ordered: [
      {tag: 'NP00SP0'},
      {lemma:'criticar'},
      {lemma:'arbitragem'},
    ]
  }
};

const matchSel = (sel, obj) => {
  let res = true;
  Object.keys(sel).forEach(key => {
    if(key === '$or'){ res = res && _matchOr(sel.$or, obj); }
    else { res = res && sel[key] === obj[key]; }
  });
  return res;
}

_matchOr = (selectors, obj) => {
  let res = false;
  selectors.forEach(sel => {
    res = res || matchSel(sel, obj);
  });
  return res;
}

const matchOrdered = (sentence, selectors) => {
  //console.log('XXXXXXXXXXXX 4', sentence, selectors);
  let i=0;
  let j;
  let matched = [];
  selectors.forEach(sel => {
    let j=i;
    while(j < sentence.length){
      if(matchSel(sel, sentence[j])){
        matched.push({sel, token: sentence[j]});
        i = j+1;
        return;
      } else { j++; }
    }
  });

  if(selectors.length === matched.length){
    console.log('XXXXXXXX 2', matched);
  }
  return selectors.length === matched.length;
}

getAllArticles()
  .then(articles => {
    //const bls = Object.values(gazetteers).map(g => g.blacklist);
    //return Promise.resolve(gazetteersBlacklist(bls, articles));
    return Promise.resolve(runGazetteers(articles));
  })
  .then(articles => {
    articles.forEach(a => {
      a.nlp.freeling.sentences.forEach(s => {
        if(matchOrdered(s.tokens, emprestimoRule.rule.ordered)){
          console.log('XXXXXXXXXx 8', s.id, a.url);
        } else {
          //console.log('XXXXXXXXXx 9');
        }
      });
    });
    console.log('XXXXXXXXXX 99 finished');
    //articles.filter(
  });
