'use strict';

const {
  normalizeNumber,prismAlias
}=require('../card-coverage.cjs');

/**
 * Resolve the actual pinned native printing using the source's printed
 * name, set abbreviation and collector number. Do not predict a `fullName`
 * from name + set: upstream uses collector numbers to disambiguate some
 * reprints, translations, Japanese set aliases and punctuation aliases.
 *
 * This helper is a read-only original-printing identity bridge. It preserves
 * the native fullName and existing reducer, and cannot silently substitute
 * an alternate printing. A genuine duplicate exact printing fails closed,
 * including the known PRC #60 ambiguous registration.
 *
 * @param {object} manager Initialized native CardManager.
 * @param {{name:string,printing:{set:string,number:string|number}}} source
 *   An exact original published source card row.
 * @returns {{nativeId:string,card:object,source:{name:string,set:string,number:string}}}
 */
function getExactOriginalPrinting(manager,source) {
  if(typeof manager?.getAllCards!=='function'||
     typeof manager?.getCardByName!=='function')
    throw new TypeError('Expected an initialized native CardManager');
  const {name,printing}=source??{};
  if(typeof name!=='string'||!name||
     typeof printing?.set!=='string'||!printing.set||
     (typeof printing?.number!=='string'&&
      typeof printing?.number!=='number'))
    throw new TypeError('Expected exact source name, set, collector number');
  const set=printing.set.toUpperCase();
  const number=normalizeNumber(printing.number);
  const normalized=prismAlias(name);
  const matched=manager.getAllCards().filter(c=>
    (c.name===name || (normalized!==name && c.name===normalized)) &&
    String(c.set).toUpperCase()===set &&
    normalizeNumber(c.setNumber)===number);
  if(matched.length!==1)
    throw new Error('Original printing lookup requires exactly one match for '+
      name+' '+set+' #'+number+'; found '+matched.length);
  const nativeId=matched[0].fullName;
  const card=manager.getCardByName(nativeId);
  if(!card||card.name!==matched[0].name||
     String(card.set).toUpperCase()!==set||
     normalizeNumber(card.setNumber)!==number)
    throw new Error('Native CardManager lookup mismatches verified source printing');
  return {nativeId,card,
    source:{name,set,number}};
}

module.exports={getExactOriginalPrinting};
