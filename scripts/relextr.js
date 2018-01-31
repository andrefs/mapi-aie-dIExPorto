const Promise = require('bluebird');
const {mongoose,Article} = require('./lib/db');
const {URL} = require('url');
const util = require('util');
const rp   = require('request-promise');
const sources = require('./lib/sources');
const gazetteers = require('./lib/gazetteers');

mongoose.connect('mongodb://localhost/aie_develop');

let currentRequests = {};

const getAllArticles = () => {
  const query  = {'nlp.status':'success'};
  //const query  = {url: 'http://www.maisfutebol.iol.pt/liga/vitoria-setubal/fc-porto-andre-pereira-a-caminho-de-setubal'};
  const fields = 'nlp title url origId lead fetch.text';

  return Article.find(query).select(fields).limit(1000).exec();
}

const rumamRule = {
  scope: 'sentence',
  rule: {
    ordered: [
      {tag: 'NP00O00'},
      {pos: 'verb', lemma: 'emprestar'},
      {tag: 'NP00SP0'},
      {tag: 'NP00O00'},
      //{tag: 'NP00SP0'}
    ]
  }
};

const matchSel = (sel, obj) => {
  let res = true;
  Object.keys(sel).forEach(key => {
    res = res && sel[key] === obj[key];
  });
  return res;
}

const matchOrdered = (sentence, rule) => {
  //console.log('XXXXXXXXXXXX 4', sentence, rule);
  let i=0;
  let j;
  let matched = [];
  rule.ordered.forEach(sel => {
    let j=i;
    while(j < sentence.length){
      if(matchSel(sel, sentence[j])){
        matched.push({sel, token: sentence[j]});
        i = j;
        return;
      } else { j++; }
    }
  });

  if(rule.ordered.length === matched.length){
    console.log('XXXXXXXX 2', matched);
  }
  return rule.ordered.length === matched.length;
}

const gazetteersBlacklist = (blacklists, articles) => {
  articles.forEach(a => {
    a.nlp.freeling.sentences.forEach(s => {
      s.tokens.forEach(t => {
        blacklists.forEach(bl => {
          bl.forEach(x => {
            if(matchSel(x.sel, t)){
              t.tag = 'NP00V00';
              //console.log('replaced', t);
            }
          });
        });
      });
    });
  });
  return articles;
};

getAllArticles()
  .then(articles => {
    console.log('XXXXXXXXX 1', articles.length);
    const bls = Object.values(gazetteers).map(g => g.blacklist);
    return Promise.resolve(gazetteersBlacklist(bls, articles));
  })
  .then(articles => {
    articles.forEach(a => {
      a.nlp.freeling.sentences.forEach(s => {
        if(matchOrdered(s.tokens, rumamRule.rule)){
          console.log('XXXXXXXXXx 8', s.id, a.url);
        } else {
          //console.log('XXXXXXXXXx 9');
        }
      });
    });
    console.log('XXXXXXXXXX 99 finished');
    //articles.filter(
  });
