const RelExRule = require('./rel-ex-rule');

module.exports = {
  // http://www.maisfutebol.iol.pt/mercado/transferencias/sporting-liam-jordan-na-dinamarca-por-emprestimo
  emprestimoRule: new RelExRule([
      {tag: 'NP00O00'},
      {pos: 'verb', lemma: 'emprestar', person: 3},
      {tag: 'NP00SP0'},
      {tag: 'NP00O00'}
    ],
    matched => {
      return matched.map(m => m.token.form).join(' ');
    }),

  // // http://www.futebol365.pt/artigo/183001-mercado-bayern-munique-esta-interessado-em-gelson-martins/
  // // http://www.maisfutebol.iol.pt/internacional/argentina/icardi-esta-a-ser-cobicado-pelo-real-madrid-diz-sampaoli
  // interessadoRule: new RelExRule([
  //     [{tag: 'NP00O00'},{tag: 'NP00SP0'}],
  //     {form: 'interessado'} // [{lemma: 'interessado'}, {lemma:'interesse'}]
  //   ],
  //   matched => {
  //     return matched.map(m => m.form).join(' ');
  //   })


  // // -----------------------
  // //
  // arbitroRule: new RelExRule([
  //     {tag: 'NP00SP0'},
  //     {lemma:'criticar'},
  //     {lemma:'arbitragem'},
  //   ],
  //   matched => {
  //     return matched.map(m => m.form).join(' ');
  //   });
};
