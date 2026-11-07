'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'agent3-independent-native-ko-printing-prize-v1';

/** Native set labels explicitly mapped to the provided printed card pool. */
const SET_FILES = Object.freeze({
  LOT:'sm8', VIV:'swsh4', UPR:'sm5', UNM:'sm11',
  UNB:'sm10', GRI:'sm2', SMP:'smp'
});

/**
 * Cross-check actual native public-KO victim snapshots against printed HP and
 * Prize rules in the independent supplied JSON pool. Fail closed on unknown
 * printing or special rule. Does not certify attack legality or game outcomes.
 *
 * @param {Array<object>} observations Native public-KO observations.
 * @param {{cardsRoot?:string}} [options]
 * @returns {{version:string,allMatched:true,qualifiedCompetitiveGames:0,paperGameCertified:false,rows:Array<object>}}
 */
function auditNativeKoPrintedPrizeValues(observations, options={}) {
  assert.ok(Array.isArray(observations) && observations.length>0);
  const cardsRoot=options.cardsRoot??path.resolve(__dirname,'../../resources/cards/en');
  const cache=new Map();
  const rows=observations.map((observation,index)=>{
    const p=observation.victimPrinting;
    assert.ok(p && typeof p==='object');
    const {name,set,setNumber,printedHp}=p;
    const fileSet=SET_FILES[set];
    assert.ok(fileSet,'Unverified native printing set at event '+index+': '+set);
    assert.match(setNumber,/^[0-9]+$/);
    const cardId=fileSet+'-'+(set==='SMP'?'SM'+setNumber:setNumber);
    if(!cache.has(fileSet)){
      const cards=JSON.parse(fs.readFileSync(
        path.join(cardsRoot,fileSet+'.json'),'utf8'));
      assert.ok(Array.isArray(cards));
      cache.set(fileSet,cards);
    }
    const matching=cache.get(fileSet).filter(c=>c.id===cardId);
    assert.equal(matching.length,1,'Unique printed card required: '+cardId);
    const card=matching[0];
    assert.equal(card.name,name,'Native printed name mismatch: '+cardId);
    const hp=Number(card.hp);
    assert.ok(Number.isSafeInteger(hp) && hp>0);
    assert.equal(hp,printedHp,'Native printed HP mismatch: '+cardId);
    assert.ok(Number.isSafeInteger(observation.victimDamageBeforeNativeKo));
    assert.ok(observation.victimDamageBeforeNativeKo>=hp,
      'Damage below printed KO threshold: '+cardId);
    const rules=card.rules??[];
    assert.ok(Array.isArray(rules));
    const awards=rules.map(rule=>
      /opponent takes ([0-9]+) Prize cards?/i.exec(rule)).filter(Boolean);
    assert.ok(awards.length<=1,'Ambiguous printed Prize award: '+cardId);
    assert.ok(awards.length===1 || rules.length===0,
      'Unsupported special rule, manual review required: '+cardId);
    const expected=awards.length?Number(awards[0][1]):1;
    assert.ok(Number.isSafeInteger(expected));
    assert.equal(observation.nativePrizeCount,expected,
      'Native Prize award differs from printed card: '+cardId);
    return {
      eventIndex:index,trialId:observation.registeredTrialId,
      attackName:observation.attackName,
      cardId,name,printedHp:hp,
      observedDamage:observation.victimDamageBeforeNativeKo,
      printedPrizeCount:expected,nativePrizeCount:observation.nativePrizeCount,
      printedPrizeRule:awards[0]?.[0]??'ordinary one-Prize Pokemon',
      source:'resources/cards/en/'+fileSet+'.json',
      match:true
    };
  });
  return {
    version:VERSION,allMatched:true,qualifiedCompetitiveGames:0,
    paperGameCertified:false,rows
  };
}

module.exports={VERSION,SET_FILES,auditNativeKoPrintedPrizeValues};
