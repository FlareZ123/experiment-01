'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const crypto=require('node:crypto');
const {run:runFrozen,saveResult}=require('./agent3-rank26-compressor-settlement-prospective-v2.cjs');
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const VERSION='agent3-rank26-firstturn-post-compressor-readonly-v2.1';

/**
 * Snapshot source-owned and public board gates at an actual owner decision.
 * This never inspects the contents of facedown Prizes, owner's unsearched
 * deck, or opposing secret zones.
 *
 * @param {object} state
 * @param {0|1} seat
 * @returns {object|null}
 */
function sourceRootGates(state,seat) {
  const owner=state.players?.[seat];
  const opposing=state.players?.[1-seat];
  if (!owner?.active||!opposing?.active) return null;
  const ownActive=owner.active.getPokemonCard()?.name??null;
  const opposingActive=opposing.active.getPokemonCard()?.name??null;
  const slots=[owner.active,...owner.bench];
  const meloSlot=slots.find(s=>s.getPokemonCard()?.name==='Meloetta ex');
  const hasBench=name=>owner.bench.some(s=>s.getPokemonCard()?.name===name);
  const hasOwnHand=name=>owner.hand.cards.some(c=>c.name===name);
  const hasOwnDiscard=name=>owner.discard.cards.some(c=>c.name===name);
  const lightningDiscard=owner.discard.cards.filter(c=>c.name==='Lightning Energy').length;
  const meloEnergy=meloSlot?.energies?.cards.map(c=>c.name)??[];
  const meloTools=meloSlot?.tools?.map(c=>c.name)??[];
  const benchMelo=hasBench('Meloetta ex');
  const benchKoko=hasBench('Tapu Koko Prism Star');
  const cologneHeld=hasOwnHand('Canceling Cologne');
  const cologneDiscarded=hasOwnDiscard('Canceling Cologne');
  const DCEHeld=hasOwnHand('Double Colorless Energy');
  const DCEOnMelo=meloEnergy.includes('Double Colorless Energy');
  const opponentPrizes=opposing.getPrizeLeft();
  const observer={
    globalTurn:state.turn,sourceSeat:seat,
    sourceActive:ownActive,opponentActive:opposingActive,
    opposingAbilityLock:opposingActive==='Iron Thorns ex'||opposingActive==='Klefki',
    benchMelo,benchKoko,activeMelo:ownActive==='Meloetta ex',
    discardLightningCount:lightningDiscard,
    discardLightning2:lightningDiscard>=2,
    discardExeggcuteCount:owner.discard.cards.filter(c=>c.name==='Exeggcute').length,
    heldCompressor:hasOwnHand('Battle Compressor'),
    discardCompressorCount:owner.discard.cards.filter(c=>c.name==='Battle Compressor').length,
    cologneHeld,cologneDiscarded,
    DCEHeld,DCEOnMelo,
    DCEAvailable: DCEHeld||DCEOnMelo,
    meloEnergy,meloTools,
    meloCrisisTool:meloTools.includes('Technical Machine: Crisis Punch'),
    heldCrisisTool:hasOwnHand('Technical Machine: Crisis Punch'),
    kokoInLostZone:owner.lostzone.cards.some(c=>c.name==='Tapu Koko Prism Star'),
    riskyRuinsInPlay:state.players.some(p=>p.stadium?.cards.some(c=>c.name==='Risky Ruins')),
    opponentPrizes,
    opponentOnePrize:opponentPrizes===1
  };
  observer.meloKokoBench=benchMelo&&benchKoko;
  observer.kokoResourceReady=observer.meloKokoBench&&observer.discardLightning2;
  observer.colognePubliclySpent=observer.cologneDiscarded;
  observer.meloEnergyWitness=DCEOnMelo&&meloEnergy.includes('Lightning Energy');
  observer.attackWitnessPrerequisites=observer.activeMelo&&observer.meloEnergyWitness&&
    observer.meloCrisisTool&&observer.opponentOnePrize;
  return observer;
}

/** @param {object[]} readings */
function summarizeRootReadings(readings) {
  const keys=['discardLightning2','benchMelo','benchKoko','meloKokoBench',
    'kokoResourceReady','cologneHeld','cologneDiscarded',
    'DCEHeld','DCEOnMelo','DCEAvailable','activeMelo','meloCrisisTool',
    'heldCrisisTool','opponentOnePrize','attackWitnessPrerequisites',
    'riskyRuinsInPlay','kokoInLostZone'];
  return {
    sourceActionRoots:readings.length,
    any:Object.fromEntries(keys.map(k=>[k,readings.some(x=>x[k]===true)])),
    first:readings[0]??null,last:readings.at(-1)??null,
    timeline:readings
  };
}

/** @param {object} arm */
function firstTurnSettlements(arm){
  const valid=arm.settlementAudit?.receipts?.filter(e=>
    e.globalTurn===1&&e.nativeDispatchReturned===true&&e.paperMinimumMet===true)??[];
  const moved=valid.flatMap(x=>x.physicallyMoved??[]);
  return {
    positivePromptResolutions:valid.length,
    physicallyMovedCopies:moved.length,
    lightningMoves:moved.filter(x=>x.name==='Lightning Energy').length,
    exeggcuteMoves:moved.filter(x=>x.name==='Exeggcute').length,
    lightningOriginalPhysicalIds:[...new Set(moved.filter(x=>x.name==='Lightning Energy')
      .map(x=>x.id))],
    receipts:valid
  };
}

/**
 * A retrospective replay of the exact registered 24 physical seed pairs.
 * One observation-only Store dispatch hook outside the original frozen v2
 * runner captures every owner first-turn action decision root. The v2 runner,
 * original cards, source policies, native hooks and seeds remain unchanged.
 */
function diagnostic(){
  const {Store}=require(path.join(output,'game/store/store'));
  const {GamePhase}=require(path.join(output,'game/store/state/state'));
  const original=Store.prototype.dispatch;
  let current=-1;
  const captures=[];
  function observe(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&action.clientId===101){
      current++;
      captures.push([]);
    }
    const state=this.state;
    const seat=Math.floor(current/2)%2;
    const expectedClient=seat===0?101:202;
    if(current>=0&&current<48&&
       state?.turn===1&&state.phase===GamePhase.PLAYER_TURN&&
       state.activePlayer===seat&&action?.clientId===expectedClient&&
       !state.prompts.some(p=>p.result===undefined)){
      const gates=sourceRootGates(state,seat);
      if(gates)captures[current].push({
        ...gates,ordinal:captures[current].length,
        action:action.constructor.name,
        proposedOwnerCard:typeof action.handIndex==='number'?
          state.players[seat].hand.cards[action.handIndex]?.name??null:null
      });
    }
    return original.call(this,action,...args);
  }
  Store.prototype.dispatch=observe;
  let cohort;
  try{cohort=runFrozen();}
  finally{
    assert.strictEqual(Store.prototype.dispatch,observe);
    Store.prototype.dispatch=original;
  }
  assert.equal(current,47);
  assert.equal(captures.length,48);
  assert.equal(cohort.cases.length,24);
  const s=cohort.summary;
  assert.equal(s.originalSourceDeals,24);
  assert.equal(s.nativeArms,48);
  assert.equal(s.physicallyMatched,24);
  assert.equal(s.physicalUnverified,0);
  assert.equal(s.physicallyDifferent,0);
  assert.equal(s.nativeErrors.length,0);
  assert.equal(s.actualSourceFirst,14);
  assert.equal(s.sourceFirstBaselineCompressor,0);
  assert.equal(s.sourceFirstTreatmentCompressor,8);
  assert.equal(s.sourceFirstTreatmentOwnerPromptSelections,8);
  assert.equal(s.sourceFirstBaselinePhysicalSettlements,11);
  assert.equal(s.sourceFirstTreatmentPhysicalSettlements,11);
  assert.equal(s.sourceFirstTreatmentPhysicalLightningCopies,25);
  assert.equal(s.sourceFirstTreatmentPhysicalExeggcuteCopies,17);
  assert.equal(s.sourceFirstNewCrisisPunch,0);
  assert.equal(s.controlNativeTerminals,3);
  assert.equal(s.treatmentNativeTerminals,3);

  const cases=cohort.cases.map((c,i)=>({
    repeat:c.repeat,slot:c.slot,seed:c.seed,sourceSeat:c.sourceSeat,
    physicalDisposition:c.physicalDisposition,
    sourceActuallyFirst:c.baseline.sourceFirst,
    baseline:{
      physical:firstTurnSettlements(c.baseline),
      roots:summarizeRootReadings(captures[2*i])
    },
    treatment:{
      physical:firstTurnSettlements(c.treatment),
      roots:summarizeRootReadings(captures[2*i+1])
    },
    sourceFirstBattleCompressorActions:{
      baseline:c.baseline.sourceFirstCompressorPlays,
      treatment:c.treatment.sourceFirstCompressorPlays
    },
    competitiveGameQualified:false
  }));
  const sourceFirst=cases.filter(c=>c.sourceActuallyFirst===true);
  const count=fn=>sourceFirst.filter(fn).length;
  const gateCounts=(arm)=>Object.fromEntries(Object.keys(
    sourceFirst[0]?.[arm]?.roots.any??{}).map(k=>[
      k,count(c=>c[arm].roots.any[k]===true)]));
  const summary={
    originalSourceDeals:24,nativeArms:48,exactPhysicalPairs:24,
    actualSourceFirst:sourceFirst.length,
    baselineFirstTurnCompressor:count(c=>c.sourceFirstBattleCompressorActions.baseline>0),
    treatmentFirstTurnCompressor:count(c=>c.sourceFirstBattleCompressorActions.treatment>0),
    baselineFirstTurnPhysicalSettlements:count(c=>c.baseline.physical.positivePromptResolutions>0),
    treatmentFirstTurnPhysicalSettlements:count(c=>c.treatment.physical.positivePromptResolutions>0),
    baselineFirstTurnTwoDistinctLightningViaCompressor:count(c=>
      c.baseline.physical.lightningOriginalPhysicalIds.length>=2),
    treatmentFirstTurnTwoDistinctLightningViaCompressor:count(c=>
      c.treatment.physical.lightningOriginalPhysicalIds.length>=2),
    baselineFirstTurnLightningMovements:sourceFirst.reduce((n,c)=>
      n+c.baseline.physical.lightningMoves,0),
    treatmentFirstTurnLightningMovements:sourceFirst.reduce((n,c)=>
      n+c.treatment.physical.lightningMoves,0),
    baselineFirstTurnExeggcuteMovements:sourceFirst.reduce((n,c)=>
      n+c.baseline.physical.exeggcuteMoves,0),
    treatmentFirstTurnExeggcuteMovements:sourceFirst.reduce((n,c)=>
      n+c.treatment.physical.exeggcuteMoves,0),
    baselineFirstTurnGateCounts:gateCounts('baseline'),
    treatmentFirstTurnGateCounts:gateCounts('treatment'),
    newFirstTurnCrisisPunch:0,competitiveQualifiedGames:0
  };
  const archivedSha=crypto.createHash('sha256')
    .update(JSON.stringify(cohort,null,2)+'\n').digest('hex');
  return {
    schema:VERSION,
    classification:'retrospective read-only replay of v2 frozen registered original physical seeds',
    immutableOriginalSourceSeedBase:20261106,immutableRepeats:[72,83],
    engineRevision:cohort.engineRevision,
    originalBaselineJsonReplaySha256:archivedSha,
    frozenBaselineSummary:s,
    summary,cases
  };
}

module.exports={VERSION,sourceRootGates,summarizeRootReadings,
  firstTurnSettlements,diagnostic};
if(require.main===module){
  const result=diagnostic();
  saveResult(path.resolve(process.cwd(),'agent3-rank26-post-compressor-gates-v21.json'),result);
  process.stdout.write('AGENT3_RANK26_POSTCOMPRESSOR_V21 '+
    JSON.stringify(result.summary)+'\n');
}
