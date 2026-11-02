'use strict';

const path = require('node:path');

/**
 * Exact printed Abilities whose trigger explicitly requires playing this
 * Pokémon FROM HAND onto the Bench. The keys match original Aichi printed
 * deck-list identities; no behavior is inferred for other printings.
 * Confirmed against the bundled card text for UNB57, DAA104, GRI60, RCL19.
 * @type {Readonly<Record<string,string>>}
 */
const HAND_ONLY_BENCH_ABILITIES=Object.freeze({
  'Dedenne-GX|UNB|57':'Dedechange',
  'Crobat V|DAA|104':'Dark Asset',
  'Tapu Lele-GX|GRI|60':'Wonder Tag',
  'Eldegoss V|RCL|19':'Happy Match'
});

const NOT_HAND_ENTRY_CONSTRAINED=Object.freeze({
  'Squawkabilly ex|PAL|169':'Squawk and Seize'
});

/**
 * @typedef {{name:string,printing:{set:string,number:string},count:number,
 * category:string}} SourceCard
 * @param {SourceCard} card
 * @returns {string}
 */
function printingKey(card){
  return card.name+'|'+card.printing.set+'|'+card.printing.number;
}

/**
 * An owner-deck Battle VIP Pass search puts a Basic directly on the Bench,
 * and therefore cannot trigger a "play this Pokémon from your hand" Ability.
 * This does not imply the Pokémon is strategically worthless; other Abilities,
 * attacks, and future effects remain separate questions.
 *
 * @param {SourceCard} card
 * @param {'from-hand'|'direct-deck-to-bench'} arrival
 * @returns {{ability:string,handEntryConditionMet:boolean,
 *    otherActivationConditionsVerified:false}|null}
 */
function benchAbilityEntryContract(card,arrival){
  if(arrival!=='from-hand'&&arrival!=='direct-deck-to-bench')
    throw new RangeError('Unsupported Bench entry provenance');
  const key=printingKey(card);
  const handOnly=HAND_ONLY_BENCH_ABILITIES[key];
  if(handOnly)return {
    ability:handOnly,
    handEntryConditionMet:arrival==='from-hand',
    otherActivationConditionsVerified:false
  };
  const other=NOT_HAND_ENTRY_CONSTRAINED[key];
  if(other)return {
    ability:other,
    handEntryConditionMet:true,
    otherActivationConditionsVerified:false
  };
  return null;
}

/**
 * A descriptive full-field census, not a decision policy or native engine
 * action trace. The base deck database is the 29 authenticated original 60s.
 * @param {{decks:Array<{rank:number,archetype:string,cards:SourceCard[]}>}} original
 * @returns {object}
 */
function summarizeVipHandEntryExposure(original){
  const rows=original.decks.filter(deck=>
    deck.cards.some(card=>card.name==='Battle VIP Pass')).map(deck=>{
    const vip=deck.cards.find(card=>card.name==='Battle VIP Pass');
    const handOnly=deck.cards.filter(card=>
      Boolean(HAND_ONLY_BENCH_ABILITIES[printingKey(card)]));
    return {
      rank:deck.rank,archetype:deck.archetype,vipCopies:vip.count,
      physicalHandOnlyCopies:handOnly.reduce((n,card)=>n+card.count,0),
      printings:handOnly.map(card=>({
        name:card.name,printing:printingKey(card),
        copies:card.count,ability:HAND_ONLY_BENCH_ABILITIES[printingKey(card)]
      }))
    };
  });
  return {
    authenticatedSourceCount:original.decks.length,
    vipSourceCount:rows.length,
    vipSourceWithHandOnlyBenchAbility:rows.filter(row=>row.physicalHandOnlyCopies>0).length,
    handOnlyPhysicalCopies:rows.reduce((n,row)=>n+row.physicalHandOnlyCopies,0),
    vipPhysicalCopies:rows.reduce((n,row)=>n+row.vipCopies,0),
    rows,
    scope:'Printed-deck opportunity only; actual VIP draws, target choices, Ability availability and wins unmeasured'
  };
}

if(require.main===module){
  const source=require(path.resolve(__dirname,'../results/aichi-2026/full-decklists.json'));
  process.stdout.write(JSON.stringify(summarizeVipHandEntryExposure(source),null,2)+'\n');
}

module.exports={HAND_ONLY_BENCH_ABILITIES,NOT_HAND_ENTRY_CONSTRAINED,
  printingKey,benchAbilityEntryContract,summarizeVipHandEntryExposure};
