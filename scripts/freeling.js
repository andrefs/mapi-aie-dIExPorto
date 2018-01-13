const Promise = require('bluebird');
const {mongoose,Article} = require('./lib/db');
const sources = require('./lib/sources');
const spawn = require('child_process').spawn;

mongoose.connect('mongodb://localhost/aie_develop');


const getFetchedArticles = () => {
  const query = {
    'fetch.status':'success',
    'nlp.status':{$ne:'success'},
    'nlp.freeling':{$exists:false}
  };
  return Article.find(query).limit(80).exec();
}

const str = `Yacine Brahimi e Moussa Marega evoluíram este sábado para treino de recuperação ativa, segundo informou o FC Porto.

Depois de uma sexta-feira diferente, passada no spa, e na qual os dois jogadores em questão fizeram apenas tratamento, o treino deste sábado voltou a realizar-se no Olival.

Otávio voltou a ficar de fora, fazendo treino condicionado e trabalho de ginásio, enquanto Diogo Dalot trabalhou com a equipa B.

Os portistas voltam a treinar no domingo, a partir das 10h00, e Sérgio Conceição fará a partir das 11h30 a antevisão ao encontro de segunda-feira com o Estoril.

Acompanhe aqui o Estoril Praia x FC Porto em direto e ao minuto, com todas as estatísticas e as curiosidades mais interessantes.
`;


const spawn_freeling = stdin => {
  const cmd = 'fl_analyze'
  const cmd_args = ['-f','scripts/pt.cfg','--noflush','--output','json'];

  const fl = spawn(cmd, cmd_args);
  fl.stdin.write(str);
  fl.stdin.end();

  let json = '';

  fl.stdout.on('data', data => {
    json += data.toString('utf8');
  });

  fl.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  return new Promise((resolve, reject)=> {
    fl.on('exit',  (code, signal) => {

      const sentences = parseFreeling(json);
      if(code ===0){
        return resolve(sentences);
      } else{
        return reject(code);
      }
    });
  });
}

const parseFreeling = json => {
  json = json.replace(/\s*}\s*]\s*}\s*]\s*}\s*/g, '}]}]},');
  json = json.replace(/,\s*$/,']');
  json = '[' + json;

  const obj = JSON.parse(json);
  let result = {sentences: []};
  obj.forEach(x => {
    result.sentences.push(...x.sentences);
  });
  return result;
}

spawn_freeling()
  .then(s => console.log(JSON.stringify(s, null, 4)));
