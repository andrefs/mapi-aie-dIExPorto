const Selector = require('./selector');

const _list = [
  {
    sel: {lemma: 'maisfutebol'},
    fix: {tag: 'NP00V00'}
  },
  {
    sel: {lemma: 'vitória_de_setúbal'},
    fix: {tag: 'NP00O00'}
  },
  {
    sel: {lemma: 'jogo', ctag: 'NP'},
    fix: {tag: 'NP00V00'}
  }
].map(x => { return {sel: new Selector(x.sel), fix: x.fix}; });


const runGazetteers = articles => {

  articles.forEach(a => {
    a.nlp.freeling.sentences.forEach(s => {
      s.tokens = s.tokens.map(t => {
        let res;

        _list.forEach(rule => {
          if(!rule.sel.match(t)){
            res = t;
          }
          else if(rule.fix['$replace']){
            res = rule.fix['$replace'];
          }
          else {
            res = {...t, ...rule.fix};
          }
        });

        return res;
      });
    });
  });
  return articles;
};

module.exports = runGazetteers;
