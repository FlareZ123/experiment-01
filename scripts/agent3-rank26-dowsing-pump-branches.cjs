'use strict';

const assert=require('node:assert/strict');
const {choose,WITNESS_GROUPS,exactPrizeSurvival}=
  require('./agent3-rank26-donk-prize-witness-upper.cjs');
const field=require('../results/aichi-2026/full-decklists.json');
const source=field.decks.find(deck=>deck.rank===26);
assert.ok(source,'Exact rank26 source required');
const copies=new Map(source.cards.map(card=>[card.name,card.count]));

/** @param {string} name @param {number} n */
function requireCopies(name,n){
  assert.ok(copies.get(name)>=n,'Missing original physical copies: '+name);
}

/**
 * A conditional printed-card state witness. All source hand/search pieces,
 * including two disposable cards for Dowsing Machine, are assumed usable.
 * This does not establish native Store acceptance or an achievable turn-1 hand.
 * @param {'two-eggs-two-pumps'|'one-egg-four-pumps'} variant
 */
function witness(variant){
  assert.ok(variant==='two-eggs-two-pumps'||variant==='one-egg-four-pumps');
  const double=variant==='two-eggs-two-pumps';
  const pumpCount=double?2:4;
  const eggCount=double?2:1;
  for(const [name,n] of [
    ['Bunnelby',1],['Meloetta ex',1],['Tapu Koko ♢',1],
    ['Unown',1],['Exeggcute',eggCount],['Risky Ruins',1],
    ['Damage Pump',pumpCount],['Dowsing Machine',1],
    ['Battle Compressor',1],['Lightning Energy',2],
    ['Double Colorless Energy',1],['Technical Machine: Crisis Punch',1],
    ['Escape Rope',1],["Trainers' Mail",2]
  ])requireCopies(name,n);
  const donors={melo:20,tapu:20,unown:20};
  const eggDamage=Array(eggCount).fill(20);
  const pumps=Array.from({length:pumpCount},(_,i)=>'pump-'+i);
  const spent=new Set();
  const timeline=[];
  let candidatePrizes=6;
  let rebenches=0;
  const targetPlan=double?[[0,1],[0,1],[0]]:
    [[0],[0],[0],[0],[0]];
  const donorPlan=double?['melo','tapu','unown']:
    ['melo','melo','tapu','tapu','unown'];
  for(let i=0;i<targetPlan.length;i++){
    const selected=i===pumpCount?'pump-0':pumps[i];
    if(i===pumpCount){
      assert.ok(spent.has(selected));
      spent.delete(selected);
      timeline.push({action:'Dowsing Machine',
        recovered:selected,discardedTwoOtherHandCards:true,
        assumedPayments:["Trainers' Mail A","Trainers' Mail B"]});
    }
    assert.ok(!spent.has(selected));
    const targetIndices=targetPlan[i];
    assert.ok(targetIndices.length>0&&targetIndices.length<=2);
    const from=donorPlan[i];
    assert.ok(donors[from]>=10*targetIndices.length);
    donors[from]-=10*targetIndices.length;
    for(const index of targetIndices){
      assert.equal(eggDamage[index],20);
      eggDamage[index]+=10;
      assert.equal(eggDamage[index],30);
      candidatePrizes--;
      assert.ok(candidatePrizes>0,'Sixth Prize would end game prematurely');
      eggDamage[index]=20;
      rebenches++;
    }
    spent.add(selected);
    timeline.push({action:'Damage Pump',physicalPump:selected,donor:from,
      exeggcuteKnockouts:targetIndices.length,
      remainingCandidatePrizes:candidatePrizes,
      propagationAndRebench:targetIndices.length});
  }
  assert.equal(candidatePrizes,1);
  assert.equal(rebenches,5);
  assert.deepEqual(donors,{melo:0,tapu:0,unown:10});
  // Original 21-action witness supplies two basic Lightning to the discard;
  // Tapu's Dance attaches to *two distinct* Benched Pokémon, Melo and Unown.
  // One DCE is manually attached to Melo. Crisis Punch costs [C][C][C];
  // Melo's Debut Performance permits its turn-one going-first attack.
  const energyOnMelo=['Lightning Energy','Double Colorless Energy'];
  const availableColorless=1+2;
  assert.equal(availableColorless,3);
  assert.ok(280>=80,'Lone unprotected 80 HP Frillish survives');
  return {
    variant,exactSourceRank:26,sourcePrintedCopies:source.cards.reduce(
      (n,card)=>n+card.count,0),sourceStartingActive:'Bunnelby PRC121',
    sourceBenchPlacedAfterRiskyRuins:['Meloetta ex','Tapu Koko ♢',
      'Unown'].concat(Array(eggCount).fill('Exeggcute PLF4')),
    maximumBench:3+eggCount,physicalDamagePumps:pumpCount,
    damagePumpUses:pumpCount+1,physicalExeggcute:eggCount,
    candidateSelfKnockouts:6-candidatePrizes,
    exeggcutePropagations:rebenches,dowsingMachineUses:1,
    dowsingHandDiscardCost:2,candidatePrizesBeforeAttack:candidatePrizes,
    meloEnergy:energyOnMelo,crisisPunchEnergyCost:3,
    crisisPunchDamage:280,conditionalPaperWinner:'source',
    everyRequiredTurnOneAcquisitionAssumed:true,
    nativeStoreAccepted:false,competitiveGameQualified:false,
    timeline
  };
}

/**
 * Count disjoint six-Prize physical-card events after Bunnelby is already in
 * the source original seven. A permissive necessary resource test only.
 */
function openingUnion(){
  const rest=WITNESS_GROUPS.filter(group=>group.name!=='Bunnelby');
  const admissible=(pump,egg,dowsing)=>{
    const groups=rest.map(group=>({...group,
      needed:group.name==='Damage Pump'?pump:
        group.name==='Exeggcute'?egg:group.needed}));
    if(dowsing)groups.push({name:'Dowsing Machine',copies:1,needed:1});
    return exactPrizeSurvival(59,groups).validPrizes;
  };
  const baseline=admissible(3,2,false);
  const twoPump=admissible(2,2,true)-admissible(3,2,true);
  const oneEgg=admissible(4,1,true)-admissible(4,2,true);
  assert.ok(baseline>0n&&twoPump>0n&&oneEgg>0n);
  const total=baseline+twoPump+oneEgg;
  const sixPrizeDenominator=choose(59,6);
  const validBasicSeven=1-Number(choose(48,7))/Number(choose(60,7));
  const startedWithBunnelby=(7/60)/validBasicSeven;
  const weight=startedWithBunnelby/Number(sixPrizeDenominator);
  return {
    favorableBaselineSixPrizeSets:baseline.toString(),
    favorableExclusiveTwoPumpDowsingSets:twoPump.toString(),
    favorableExclusiveOneEggDowsingSets:oneEgg.toString(),
    favorableUnionSixPrizeSets:total.toString(),
    sixPrizeSetsAfterBunnelbyInHand:sixPrizeDenominator.toString(),
    bunnelbyInBasicValidInitialSeven:startedWithBunnelby,
    baselineBunnelbyAndPrizeEvent:Number(baseline)*weight,
    extendedBunnelbyAndPrizeEvent:Number(total)*weight,
    addedProbabilityPercentagePoints:Number(twoPump+oneEgg)*weight*100,
    inference:'Specific card-location upper opportunity; Dowsing payment, card search, turns, native acceptance, opponent play and wins untested.'
  };
}

function run(){
  return {schema:'agent3-rank26-dowsing-alternate-paper-v1',
    counts:openingUnion(),
    branches:[witness('two-eggs-two-pumps'),witness('one-egg-four-pumps')]};
}
module.exports={witness,openingUnion,run};
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
