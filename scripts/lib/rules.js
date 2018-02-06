const RelExRule = require('./rel-ex-rule');

// Jorge Jesus sobre Gelson Martins
// assina por
// Síntese: V. Guimarães vence Paços Ferreira
// parabens
// acredita
// Jesus aposta em Bruno César e Doumbia
// poderá

module.exports = {
  // // http://www.zerozero.pt/news.php?id=213116
  // // http://www.maisfutebol.iol.pt/internacional/inglaterra/foto-richarlison-em-lagrimas-no-banco-do-watford
  // lagrimasRule: new RelExRule([
  //     {tag: 'NP00SP0'},
  //     {form: 'lágrimas'}
  //   ],
  //   (matched, context) => {
  // }),

  // http://www.maisfutebol.iol.pt/mercado/transferencias/sporting-liam-jordan-na-dinamarca-por-emprestimo
  emprestimoRule: new RelExRule([
      {tag: 'NP00O00'},
      {pos: 'verb', lemma: 'emprestar', person: 3},
      {tag: 'NP00SP0'},
      {tag: 'NP00O00'}
    ],
    (matched, context) => {
      let res = [];
      const teamA = matched[0];
      const teamB = matched[3];
      const player = matched[2];
      res.push({context, name: teamA.token.form,  className: 'Team'});
      res.push({context, name: teamB.token.form,  className: 'Team'});
      res.push({
        context,
        name: player.token.form,
        className: 'Athlete',
        rels: {
          borrowedFrom: teamA.token.form,
          borrowedTo: teamB.token.form,
        }
      });
      return res;
      //return matched.map(m => m.token.form).join(' ');
    }),

  apostaRule1: new RelExRule([
      [{tag: 'NP00O00'},{tag: 'NP00SP0'}],
      {pos: 'verb', lemma: 'apostar', person: 3},
      [{tag: 'NP00SP0'}],
    ], (matched, context) => {
      let res = [];
      const class1 = matched[0].token.tag === 'NP00O00' ? 'Team' : 'Person';
      const class2 = matched[0].token.tag === 'NP00O00' ? 'Team' : 'Person';

      res.push({context, name: matched[2].token.form,  className: class2});
      res.push({
        context,
        name: matched[0].token.form,
        className: class1,
        rels: {
          reliesOn: matched[2].token.form,
        }
      });
      return res;
  }),

  apostaRule2: new RelExRule([
      [{tag: 'NP00SP0'}],
      {pos: 'verb', lemma: 'apostar', person: 3},
      [{tag: 'NP00O00'},{tag: 'NP00SP0'}],
    ], (matched, context) => {
      let res = [];
      const class1 = matched[0].token.tag === 'NP00O00' ? 'Team' : 'Person';
      const class2 = matched[0].token.tag === 'NP00O00' ? 'Team' : 'Person';

      res.push({context, name: matched[2].token.form,  className: class2});
      res.push({
        context,
        name: matched[0].token.form,
        className: class1,
        rels: {
          reliesOn: matched[2].token.form,
        }
      });
      return res;
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
