'use strict';

// No-game paper-card-text tactical oracle for a particular fixed Hood Shield
// 60's Shadow Rider V -> VMAX switching dilemma. NOT a native Store model,
// not a candidate-list optimization, not a competitive result.
const ENERGY = Object.freeze({
  BASIC: 'Psychic Energy MEE 13',
  MYSTERY: 'Mystery Energy PHF 112',
  JET: 'Jet Energy PAL 190',
  WARP: 'Warp Energy SLG 70'
});

/** Strict, entire state must be user-supplied and public. */
function runMobilityCounterline(state, energy) {
  if (!Object.values(ENERGY).includes(energy))
    throw new Error('UNKNOWN_ENERGY_PRINTING');
  for (const key of ['activePsychic','retreatAlreadyUsed','retreatBlocked',
    'activeAsleepOrParalyzed','handAttachmentAlreadyUsed','specialEnergyPlayLocked',
    'specialEnergyEffectsSuppressed','hasBenchedAttacker']) {
    if(typeof state?.[key] !== 'boolean')
      throw new Error('UNKNOWN_PUBLIC_CONSTRAINT:'+key);
  }
  for (const key of ['activeRetreatCost','psychicTotalBefore','benchedPsychic',
    'benchedColorless','targetRemainingHP']) {
    if(!Number.isSafeInteger(state[key]) || state[key]<0)
      throw new Error('UNKNOWN_PUBLIC_COUNT:'+key);
  }
  const isBasic=energy===ENERGY.BASIC;
  const isMystery=energy===ENERGY.MYSTERY;
  const isJet=energy===ENERGY.JET;
  const isWarp=energy===ENERGY.WARP;
  const isSpecial=!isBasic;
  const attachmentLegal=!state.handAttachmentAlreadyUsed &&
    !(isSpecial && state.specialEnergyPlayLocked) &&
    (!isMystery || state.activePsychic) &&
    // Jet attaches directly to a Benched Pokémon; other three to Active.
    (!isJet || state.hasBenchedAttacker);
  const effectLive=attachmentLegal &&
    (!isSpecial || !state.specialEnergyEffectsSuppressed);
  const effectiveRetreatCost=Math.max(0,state.activeRetreatCost -
    (effectLive && isMystery ? 2 : 0));
  const actualActiveEnergies=attachmentLegal ?
    (isBasic ? 1 : isMystery && effectLive ? 1 : 0) : 0;
  const normalRetreatLegal=attachmentLegal && state.hasBenchedAttacker &&
    !state.retreatAlreadyUsed && !state.retreatBlocked &&
    !state.activeAsleepOrParalyzed &&
    actualActiveEnergies >= effectiveRetreatCost;
  const instantaneousSwitch=attachmentLegal && effectLive &&
    (isJet || (isWarp && state.hasBenchedAttacker));
  const canPromoteAttacker=state.hasBenchedAttacker &&
    (instantaneousSwitch || normalRetreatLegal);
  // Mystery on Psychic V remains on the Bench after its free normal retreat
  // and counts as Psychic for VMAX Max Geist. Basic attached to Active and
  // later paid as retreat cost may not remain; this narrow state has 0 before.
  const psychicAfter=state.psychicTotalBefore +
    (canPromoteAttacker && effectLive && isMystery ? 1 : 0);
  const benchP=state.benchedPsychic;
  const benchC=state.benchedColorless + (isJet && attachmentLegal ? 1 : 0);
  const canPayMaxGeist=canPromoteAttacker &&
    benchP>=2 && benchP+benchC>=3;
  const maxGeistDamage=canPayMaxGeist ? 10+30*psychicAfter : null;
  return {
    energy,attachmentLegal,effectLive,effectiveRetreatCost,
    normalRetreatLegal,instantaneousSwitch,canPromoteAttacker,
    canPayMaxGeist,maxGeistDamage,
    potentialKnockout:canPayMaxGeist &&
      maxGeistDamage>=state.targetRemainingHP,
    attachedTo:isJet?'bench':'active',
    psychicAfter
  };
}

/** Fixed original printed-60 membership only; alternate is a 1-for-1 hypothesis. */
function energySwapDeck(cards, newEnergy) {
  if (![ENERGY.MYSTERY,ENERGY.JET,ENERGY.WARP].includes(newEnergy))
    throw new Error('EXPECTED_ONE_SPECIAL_ENERGY');
  if (!Array.isArray(cards)||cards.some(row=>
    !Number.isSafeInteger(row?.count)||row.count<1 ||
    !row.printing || !row.name)) throw new Error('INVALID_SOURCE_DECK');
  if(cards.reduce((n,c)=>n+c.count,0)!==60)throw new Error('NOT_FIXED_60');
  const result=cards.map(row=>({...row,printing:{...row.printing}}));
  const psychic=result.find(row=>row.name==='Psychic Energy' &&
    row.printing.set==='MEE' && row.printing.number==='13');
  if(!psychic||psychic.count!==11)throw new Error('EXPECTED_11_ORIGINAL_BASIC_PSYCHIC');
  psychic.count--;
  const [name,set,number]=newEnergy===ENERGY.MYSTERY ?
    ['Mystery Energy','PHF','112'] : newEnergy===ENERGY.JET ?
      ['Jet Energy','PAL','190'] : ['Warp Energy','SLG','70'];
  result.push({category:'Energy',count:1,name,
    printing:{set,number,language:'en'}});
  if(result.reduce((n,c)=>n+c.count,0)!==60)
    throw new Error('ALTERNATE_60_CONSERVATION_FAILED');
  return result;
}

module.exports={ENERGY,runMobilityCounterline,energySwapDeck};
