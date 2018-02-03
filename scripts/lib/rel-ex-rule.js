const Selector = require('./selector');

module.exports = class RelExRule {

  constructor(selList){
    this.selList = selList.map(sel => new Selector(sel));
  }

  matchOrdered(sentence){
    let tPos=0; // current token position
    let cPos;   // current candidate position
    let matched = [];
    this.selList.forEach(sel => {
      let cPos=tPos;
      while(cPos < sentence.length){
        if(sel.match(sentence[cPos])){
          matched.push({sel, token: sentence[cPos]});
          tPos = cPos+1;
          return;
        } else { cPos++; }
      }
    });

    if(this.selList.length === matched.length){
      console.log('XXXXXXXX 2', matched);
    }
    return this.selList.length === matched.length;
  }

};
