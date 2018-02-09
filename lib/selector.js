
module.exports = class Selector {

  constructor(sel){
    this.sel = sel;
  }

  match(token){
    return this._match(this.sel, token);
  }


  _match(sel, token){
    if(Array.isArray(sel)){ return this._matchAny(sel, token); }

    let res = true;
      Object.keys(sel).forEach(k => {
      res = res && this._matchVal(sel[k], token[k]);
    });
    return res;
  }


  _matchAny(sels, token){
    let res = false;
    sels.forEach(sel => {
      res = res || this._match(sel,token);
    });
    return res;
  }

 _matchVal(selVal, tokenVal){
    if(selVal instanceof RegExp){
      return !! tokenVal.toString().match(selVal);
    }
    return selVal === tokenVal;
  }
};
