const Promise = require('bluebird');
const {mongoose,Article} = require('./db');
const runGazetteers = require('./gazetteers');
const rules = require('./rules');
const uniq = require('uniq');

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
      return sanitizeInstances(allMatched);
    });
  });
};

const sanitizeInstances = instances => {
  let _tmp = {};
  instances.forEach(i => {
    let object       = _tmp[i.name] || {};
    object.name      = i.name;
    object.className = i.className;
    if(i.context && i.context.url){
      object.context = object.context || {url: []};
      object.context.url.push(i.context.url);
    }
    if(i.rels){
      let rels = object.rels || [];
      Object.keys(i.rels).forEach(rel => {
        rels.push({name: rel, subject: i.rels[rel]});
      });
      object.rels = rels;
    }
    _tmp[i.name] = object;
  });

  Object.values(_tmp).forEach(obj => {
    if(obj.rels){
      obj.rels = uniq(obj.rels,
        (r1, r2) => {
          if(r1.name === r2.name && r1.subject === r2.subject){
            return 0;
          }
          return 1;
        });
    }
    if(obj.context && obj.context.url){
      obj.context.url = uniq(obj.context.url);
    }
  });

  return Object.values(_tmp);
}

module.exports = extractRelations;


