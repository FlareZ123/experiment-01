'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent27-owner-trainer-discard-contention-v1';

/*
 * Only printings whose discard requirements were checked against the bundled
 * English card database are admitted. Both exact-print and cardinality matter:
 * older Quick Ball printings have a different effect and must never inherit
 * the Sword & Shield discard rule.
 *
 * This catalog concerns payment from the ORIGINAL owner hand. Card-specific
 * targets, search legality, locks and the future outcome remain unresolved.
 */
const COST_BY_PRINT = new Map();
function register(name, sets, options, type = 'Item') {
  for (const set of sets) {
    const key = name + ' ' + set;
    assert.ok(!COST_BY_PRINT.has(key));
    COST_BY_PRINT.set(key, Object.freeze({type,
      options: Object.freeze(options.map(x => Object.freeze({...x})))
    }));
  }
}
register('Quick Ball', ['SSH','FST'], [{mode:'required',discards:1}]);
register('Ultra Ball',
  ['PLB','DEX','PLF','FLF','FCO','ROS','SLG','SUM','BRS','CRZ','SVI',
    'PAF','MEG','ASC','30C'],
  [{mode:'required',discards:2}]);
register('Mysterious Treasure',['FLI'],[{mode:'required',discards:1}]);
register('Secret Box',['TWM'],[{mode:'required',discards:3}]);
register('Computer Search',['BCR'],[{mode:'required',discards:2}]);
register('Earthen Vessel',['PAR','SFA','PRE'],[{mode:'required',discards:1}]);
register('Superior Energy Retrieval',['PLF','PAL'],
  [{mode:'required',discards:2}]);
register('Guzma & Hala',['CEC'],[
  {mode:'stadium-only',discards:0},
  {mode:'enhanced-tool-energy',discards:2}
], 'Supporter');
// Distinct original printed Supporter/ACE SPEC hand-payment modes, read
// directly from their English set/collector texts. These are physical costs,
// never proof of paper-playable targets or value.
register('Plumeria',['BUS'],
  [{mode:'required-energy-denial',discards:2}], 'Supporter');
register('Bellelba & Brycen-Man',['CEC'],[
  {mode:'ordinary-top-deck-discard',discards:0},
  {mode:'enhanced-three-bench-discard',discards:3}
], 'Supporter');
register('Cynthia & Caitlin',['CEC'],[
  {mode:'ordinary-supporter-retrieval',discards:0},
  {mode:'optional-draw-three',discards:1}
], 'Supporter');
register('Dowsing Machine',['PLS'],
  [{mode:'required-trainer-retrieval',discards:2}]);
register('Battle VIP Pass',['FST'],[{mode:'no-discard',discards:0}]);
register("Trainers' Mail",['ROS'],[{mode:'no-discard',discards:0}]);
register("Professor's Letter",['XY','BKT'],
  [{mode:'no-discard',discards:0}]);
// Pinned Twinleaf uses an apostrophe-free fullName for the same source card.
register('Professors Letter',['XY','BKT'],
  [{mode:'no-discard',discards:0}]);
register('Energy Search',['BCR','SSH','SVI','CRZ'],
  [{mode:'no-discard',discards:0}]);

// Source-card-text corroborated ORIGINAL Aichi printings with zero additional
// owner-hand card discards when played. A zero payment NEVER means that a card
// has a legal target, can be played under locks, preserves the owner's hand,
// avoids a Tool/Bench/Supporter quota, or has a worthwhile strategic effect.
// Whole-hand shufflers/discarders remain outside this fixed-cardinality catalog.
const noHandDiscardPrintings=[
  ['VS Seeker','PHF','Item'],
  ['Guzma','BUS','Supporter'],
  ['Hisuian Heavy Ball','ASR','Item'],
  ['Float Stone','BKT','Pokémon Tool'],
  ['Muscle Band','XY','Pokémon Tool'],
  ['Sky Field','ROS','Stadium'],
  ['Rescue Carrier','EVS','Item'],
  ['Rescue Stretcher','GRI','Item'],
  ['Raihan','EVS','Supporter'],
  ['Tag Call','CEC','Item'],
  ['Forest Seal Stone','SIT','Pokémon Tool'],
  ['Dark Patch','ASR','Item'],
  ['Field Blower','GRI','Item'],
  ['Lusamine','CIN','Supporter'],
  ['Escape Rope','BST','Item'],
  ['Super Rod','PAL','Item'],
  ['Enhanced Hammer','TWM','Item'],
  ['Counter Catcher','PAR','Item'],
  ['Megaton Blower','SSP','Item'],
  ['Crispin','SCR','Supporter'],
  ['Team Flare Grunt','XY','Supporter'],
  ['Temple of Sinnoh','ASR','Stadium'],
  ['Fog Crystal','CRE','Item'],
  ['Faba','LOT','Supporter'],
  ['Path to the Peak','CRE','Stadium'],
  ['Crushing Hammer','POR','Item'],
  ['Night Stretcher','ASC','Item'],
  ['Stealthy Hood','UNB','Pokémon Tool'],
  ['Nest Ball','SVI','Item'],
  ['Parallel City','BKT','Stadium'],
  ['Gladion','CIN','Supporter'],
  ['Artazon','PAL','Stadium'],
  ['Arven','OBF','Supporter'],
  ['Boost Shake','EVS','Item'],
  ['Silent Lab','PRC','Stadium'],
  ['Buddy-Buddy Poffin','TEF','Item'],
  ['Technical Machine: Evolution','PAR','Pokémon Tool'],
  ['Camping Gear','BST','Item'],
  ['Echoing Horn','CRE','Item'],
  ['Handheld Fan','TWM','Pokémon Tool'],
  ["Steven's Resolve",'CES','Supporter']
];
for(const [name,set,type] of noHandDiscardPrintings)
  register(name,[set],[{mode:'no-owner-hand-discard-payment',discards:0}],type);

// Seven original source name/set identifiers require a controlled English
// catalog-print bridge (Team Flare subtitle, Prism glyph, numbered promos).
// The strict numbered original-to-bundled identity bridge is verified in
// scripts/agent27-original-trainer-print-identity-audit.cjs.
for(const [name,set,type] of [
  ['Battle Compressor','PHF','Item'],
  ['Robo Substitute','PHF','Item'],
  ['Target Whistle','PHF','Item'],
  ['Thunder Mountain ♢','LOT','Stadium'],
  ['Wondrous Labyrinth ♢','TEU','Stadium'],
  ['Karen','XYP','Supporter'],
  ['Tropical Beach','BWP','Stadium']
]) register(name,[set],
  [{mode:'no-owner-hand-discard-payment',discards:0}],type);

/** @param {number} n @param {number} k @returns {bigint} */
function combinations(n,k) {
  assert.ok(Number.isSafeInteger(n) && n >= 0);
  assert.ok(Number.isSafeInteger(k) && k >= 0);
  if(k>n)return 0n;
  const m=Math.min(k,n-k);
  let result=1n;
  for(let i=1;i<=m;i++)
    result=result*BigInt(n-m+i)/BigInt(i);
  return result;
}

/**
 * Exact physical hand copy payment certificate. A selected Trainer is already
 * on the play stack, so it cannot pay its own cost. For a planned two-Trainer
 * line, BOTH source cards are reserved from the initial hand; the test never
 * treats the second source Trainer as a disposable first payment.
 *
 * Protection is an externally supplied strategic constraint. Without it,
 * affordability is mechanical only and says nothing about discard desirability.
 *
 * @param {string[]} hand Owner's exact hand printings, no hidden zones.
 * @param {number[]} sourceIndices Physical Trainer hand slots to preserve.
 * @param {number} firstCost Discards for first intended play.
 * @param {number} [secondCost] Discards for second intended play.
 * @param {Set<number>} [protectedIndices] Owner-defined discard protection.
 */
function physicalHandPayment(hand,sourceIndices,firstCost,secondCost=0,
  protectedIndices=new Set()) {
  assert.ok(Array.isArray(hand) &&
    hand.every(x=>typeof x==='string' && x.length>0));
  assert.ok(Array.isArray(sourceIndices) &&
    new Set(sourceIndices).size===sourceIndices.length &&
    sourceIndices.every(i=>Number.isSafeInteger(i)&&i>=0&&i<hand.length));
  assert.ok([firstCost,secondCost].every(n=>
    Number.isSafeInteger(n)&&n>=0&&n<=3));
  assert.ok(protectedIndices instanceof Set &&
    [...protectedIndices].every(i=>
      Number.isSafeInteger(i)&&i>=0&&i<hand.length));
  const reserved=new Set(sourceIndices);
  const all=hand.map((_,i)=>i).filter(i=>!reserved.has(i));
  const free=all.filter(i=>!protectedIndices.has(i));
  const required=firstCost+secondCost;
  const first=free.slice(0,firstCost);
  const second=free.slice(firstCost,required);
  return {
    requiredDiscards:required,
    allAvailableCopies:all.length,
    unprotectedAvailableCopies:free.length,
    physicallyAffordable:all.length>=required,
    affordablePreservingProtected:free.length>=required,
    forcedProtectedSacrifices:Math.max(0,required-free.length),
    physicalPaymentWays:
      (combinations(all.length,firstCost)*
       combinations(Math.max(0,all.length-firstCost),secondCost)).toString(),
    unprotectedPaymentWays:
      (combinations(free.length,firstCost)*
       combinations(Math.max(0,free.length-firstCost),secondCost)).toString(),
    illustrativeUnprotectedPayment:free.length>=required?
      {firstIndices:first,secondIndices:second}:null
  };
}

/**
 * Decorate the genuine, read-only Agent5 owner Trainer frontier with
 * initial-hand-only structural discard certificates and shared-cost pairs.
 * It neither recommends nor dispatches a native action. A pair is conditional
 * on both printing-specific plays being otherwise legal and remaining in hand.
 *
 * @param {object} view Frozen owner-root actor observation.
 * @param {object[]} genericRows Agent5's ownerTrainerOpportunity rows.
 * @param {Set<number>} [protectedIndices] Strategic discard protection.
 */
function ownerTrainerDiscardContention(view,genericRows,
  protectedIndices=new Set()) {
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(Array.isArray(view.ownHand));
  assert.ok(Array.isArray(genericRows));
  assert.ok(protectedIndices instanceof Set);
  const seen=new Set();
  const rows=genericRows.map(row=>{
    assert.ok(Number.isSafeInteger(row.handIndex) &&
      row.handIndex>=0 && row.handIndex<view.ownHand.length);
    assert.equal(view.ownHand[row.handIndex],row.printing);
    assert.ok(!seen.has(row.handIndex));
    seen.add(row.handIndex);
    const spec=COST_BY_PRINT.get(row.printing)??null;
    return {
      handIndex:row.handIndex,printing:row.printing,
      publicBlocker:row.publicBlocker??null,type:row.type,
      costKnown:spec!==null,
      variants:spec?spec.options.map(option=>({
        mode:option.mode,discards:option.discards,
        ...physicalHandPayment(view.ownHand,[row.handIndex],
          option.discards,0,protectedIndices)
      })):[]
    };
  });
  const pairs=[];
  for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
    const a=rows[i],b=rows[j];
    if(!a.costKnown||!b.costKnown)continue;
    const quotaBlocker=a.type==='Supporter'&&b.type==='Supporter'?
      'one-supporter-per-turn':
      a.type==='Stadium'&&b.type==='Stadium'?
        'one-stadium-per-turn':null;
    pairs.push({
      firstHandIndex:a.handIndex,secondHandIndex:b.handIndex,
      firstPrinting:a.printing,secondPrinting:b.printing,
      genericBlocker:a.publicBlocker??b.publicBlocker??quotaBlocker,
      variants:COST_BY_PRINT.get(a.printing).options.flatMap(x=>
        COST_BY_PRINT.get(b.printing).options.map(y=>({
          firstMode:x.mode,secondMode:y.mode,
          ...physicalHandPayment(view.ownHand,
            [a.handIndex,b.handIndex],x.discards,y.discards,
            protectedIndices)
        })))
    });
  }
  return {
    version:VERSION,actorSeat:view.actorSeat,globalTurn:view.globalTurn,
    rows,pairs,diagnosticOnly:true,
    privateInputScope:'actual owner hand indices only',
    noOpponentHiddenCards:true,
    cannotCertifyTargetOrSearch:true,
    cannotCertifyPaperAction:true,
    cannotCertifyNativeDispatch:true,
    cannotCertifyGamePerformance:true
  };
}

module.exports={VERSION,COST_BY_PRINT,combinations,physicalHandPayment,
  ownerTrainerDiscardContention};
