const Selector = require('./selector');

const _list = [
  // Teams
  {
    sel: {lemma: 'boavista'},
    fix: {tag: 'NP00O00'}
  },
  {
    sel: {lemma: 'vitória_de_setúbal'},
    fix: {tag: 'NP00O00'}
  },
  {
    sel: {lemma: 'sp._braga'},
    fix: {
		  form: "Sp._Braga",
		  lemma: "sp._braga",
		  tag: "NP00O00",
    }
  },
  {
    sel: {lemma: 'inter'},
    fix: {
		  form: "Inter_Milão",
		  lemma: "inter_milão",
		  tag: "NP00O00",
    }
  },
  {
    sel: {lemma: 'bayern_munique'},
    fix: {tag: 'NP00O00'}
  },

  // People
  {
    sel: {form:'Conceição', tag:'NP00O00'},
    fix: {
      form: 'Sérgio_Conceição'
    }
  },

  // Others
  {
    sel: {lemma: 'na', tag:'NP00O00'},
    fix: {tag: 'NP00V00'}
  },
  {
    sel: {lemma: 'maisfutebol'},
    fix: {tag: 'NP00V00'}
  },
  {
    sel: {lemma: 'jogo', ctag: 'NP'},
    fix: {tag: 'NP00V00'}
  },
  {
    sel: {lemma: 'the_sun', ctag: 'NP'},
    fix: {tag: 'NP00V00'}
  },
  {
    sel: {lemma: 'venezuelano', ctag: 'NP'},
    fix: {tag: 'NP00V00'}
  },

  // Messed up tokenization (should be fixed in Freeling) // TODO
  {
    sel: {lemma: /^ficha_de_jogo/},
    fix: {tag: 'NP00V00'}
  },
  {
    sel: {lemma: 'varzim_para_o_portimonense'},
    fix: {tag: 'NP00V00'}
  },
  {
    sel: {lemma: 'série_b_do_brasil_depois'},
    fix: {tag: 'NP00V00'}
  }
].map(x => { return {sel: new Selector(x.sel), fix: x.fix}; });


const runGazetteers = articles => {
  process.stdout.write('    fixing tokens using gazetteers... ');
  let count = 0;
  articles.forEach(a => {
    a.nlp.freeling.sentences.forEach(s => {
      s.tokens = s.tokens.map(t => {
        let res = t;

        _list.forEach(rule => {
          if(!rule.sel.match(t)){
            return;
          }
          else if(rule.fix['$replace']){
            count++;
            res = rule.fix['$replace'];
          }
          else {
            count++;
            res = {...t, ...rule.fix};
          }
        });
        return res;
      });
    });
  });
  process.stdout.write(count+' fixed\n\n');
  return articles;
};

module.exports = runGazetteers;
