'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent3-printed-base-prize-screen-v1';

/**
 * Read a specific pinned English card printing from the local research card
 * database. This is independent of the native engine's Pokémon card classes.
 *
 * @param {object} victim Public in-play native victim print.
 * @param {string} resourcesPath Repository resources directory.
 * @returns {object|null} Exact name/number English database match.
 */
function lookupPrintedVictim(victim,resourcesPath){
  assert.equal(typeof victim?.name,'string');
  assert.equal(typeof victim?.set,'string');
  assert.equal(typeof victim?.setNumber,'string');
  assert.equal(typeof resourcesPath,'string');
  const sets=JSON.parse(fs.readFileSync(
    path.join(resourcesPath,'sets/en.json'),'utf8'));
  const code=victim.set.toUpperCase();
  const aliases=code==='SMP'?['smp']:[];
  const matchingIds=[...new Set([
    ...sets.filter(set=>set.ptcgoCode?.toUpperCase()===code ||
      set.id.toUpperCase()===code).map(set=>set.id),
    ...aliases
  ])];
  const normalizeNumber=number=>String(number)
    .replace(/^SM(?=\d)/i,'').replace(/^SWSH(?=\d)/i,'');
  const records=[];
  for(const id of matchingIds){
    const file=path.join(resourcesPath,'cards/en',id+'.json');
    if(!fs.existsSync(file))continue;
    for(const card of JSON.parse(fs.readFileSync(file,'utf8'))){
      if(card.name===victim.name&&
          normalizeNumber(card.number)===normalizeNumber(victim.setNumber))
        records.push(card);
    }
  }
  assert.ok(records.length<=1,'Ambiguous English source print');
  return records[0]??null;
}

/**
 * Infer the *printed* base Prize value from an English Pokémon card.
 * Does not account for Legacy Energy, attack, Ability, Stadium, Tool or
 * contemporaneous effects modifying or redirecting an actual Prize award.
 * Unknown card-rule wording is null, never a silent one-Prize assumption.
 *
 * @param {object} printing Matching English card database record.
 * @returns {number|null}
 */
function printedBasePrizeCount(printing){
  if(!printing||printing.supertype!=='Pokémon')return null;
  const rules=printing.rules??[];
  if(!Array.isArray(rules))return null;
  const payout=[];
  for(const rule of rules){
    if(typeof rule!=='string')return null;
    const m=rule.match(/When your .+ is Knocked Out, your opponent takes (\d+) Prize cards?\./i);
    if(m)payout.push(Number(m[1]));
    else if(/Knocked Out|Prize cards?/i.test(rule))return null;
  }
  if(payout.length>1)return null;
  if(payout.length===1)return payout[0];
  const subtype=printing.subtypes??[];
  // One-Prize fallback is deliberately restricted to printed ordinary Basics.
  if(subtype.length===1&&subtype[0]==='Basic'&&rules.length===0)
    return 1;
  return null;
}

/**
 * Screen the captured exact native KO victim against an independent English
 * card-pool printing and its base Prize rule. No game or attack qualifies.
 *
 * @param {object[]} victims V28 unique KO victim joins.
 * @param {string} resourcesPath Repo resources directory.
 * @returns {object[]} One screen per observed actual native KO.
 */
function screenNativeKoBasePrizes(victims,resourcesPath){
  assert.ok(Array.isArray(victims));
  return victims.map(victim=>{
    const printed=lookupPrintedVictim(victim.victimPrinting,resourcesPath);
    const base=printedBasePrizeCount(printed);
    const nativeHp=victim.victimPrinting?.printedHp;
    const paperHp=Number(printed?.hp);
    const hpAgree=Number.isSafeInteger(nativeHp)&&
      Number.isSafeInteger(paperHp)&&nativeHp===paperHp;
    const printFound=printed!==null;
    const rulesKnown=Number.isSafeInteger(base)&&base>=1;
    return {
      prizeEventIndex:victim.prizeEventIndex,
      registeredTrialId:victim.registeredTrialId,
      victimPrintingName:victim.victimPrinting?.fullName??null,
      matchedEnglishCardDbId:printed?.id??null,
      printedEnglishHp:printFound?paperHp:null,
      nativeVictimPrintedHp:nativeHp??null,
      printedRuleTexts:printed?.rules??[],
      printedSubtype:printed?.subtypes??[],
      paperPrintedBasePrizes:base,
      actuallyAwardedNativePrizes:victim.nativePrizeCount,
      independentPrintedHpAgrees:hpAgree,
      independentPrintedBasePrizeScreenPass:
        printFound&&hpAgree&&rulesKnown&&base===victim.nativePrizeCount,
      allGamePrizeModifiersAudited:false,
      paperDamageAndAttackLegalityCertified:false,
      competitiveGameQualified:false
    };
  });
}
module.exports={
  VERSION,lookupPrintedVictim,printedBasePrizeCount,
  screenNativeKoBasePrizes
};
