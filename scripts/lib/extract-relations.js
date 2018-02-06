const Promise = require('bluebird');
const {mongoose,Article} = require('./db');
const runGazetteers = require('./gazetteers');
const rules = require('./rules');


const individuals = [{
    name: 'XXX1',
    className: 'Team',
  },{
    name: 'XXX2',
    className: 'Team',
  },{
    name: 'XXX3',
    className: 'Athlete',
    rels: {
      borrowedFrom: 'XXX2',
      borrowedTo: 'XXX1'
    }
}];

const extractRelations = () => {
  return Promise.resolve(individuals);
};

// const extractRelations = () => {
//   const query  = {'nlp.status':'success'};
// 
//   return Article.count(query).then(total => {
//     console.log('Extracting relationships from',total,'articles');
//     const limit = 100;
//     let promises = [];
//     const iters = Math.ceil(total/limit);
//     for(let i=0; i<iters; i++){
//       promises.push(() => Article.find(query).select('origId url nlp title fetch.lead fetch.text').skip(i*limit).limit(limit).lean().exec());
//     }
// 
//     let allMatched = [];
// 
//     return Promise.each(promises, getArticles => {
//       return getArticles().then(articles => {
//         runGazetteers(articles).forEach(a => {
//           a.nlp.freeling.sentences.forEach(s => {
//             const matched = Object.values(rules).map(r => r.matchOrdered(s.tokens)).filter(x => !!x);
//             allMatched.push(...matched);
//           });
//         });
//       });
//     })
//     .then(() =>
//       console.log('Extracted', allMatched.length, 'relations');
//       return allMatched;
//     );
//   });
// };

module.exports = extractRelations;


