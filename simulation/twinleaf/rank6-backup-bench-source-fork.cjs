'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {withSourceOpeningProbe}=
  require('./rank6-seed-opening-probe.cjs');
const {withBroadThornsSourceAttack}=
  require('./rank6-broad-thorns-policy.cjs');
const {withPublicAttackTargets,publicSide}=
  require('./rank6-acerola-public-observer.cjs');
const {withStoreDispatchTranscript}=
  require('./store-dispatch-transcript.cjs');

/**
 * Read only the public player's board immediately before an actual root
 * attack. This is a physical Store observation, never an injected setup.
 * @template T
 * @param {function} Store
 * @param {()=>T} work
 */
function withPublicOwnAttackBoard(Store,work) {
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  let root=null;
  const snapshots=[];
  const wrapped=function(...args) {
    const action=args[0];
    if(!root&&action?.constructor?.name==='AddPlayerAction') root=this;
    if(this===root&&action?.constructor?.name==='AttackAction'&&
       this.state.players.length===2&&this.state.activePlayer===1) {
      snapshots.push({
        turn:this.state.turn,attack:action.name,
        ownPublic:publicSide(this.state,1),
        opponentPublic:publicSide(this.state,0)
      });
    }
    return descriptor.value.apply(this,args);
  };
  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:wrapped});
  try{return {result:work(),snapshots};}
  finally{Object.defineProperty(Store.prototype,'dispatch',descriptor);}
}

/** @param {object} experiment */
function unpack(experiment) {
  const source=experiment.result;
  const line=source.out;
  const observer=line.result;
  const game=observer.result.result;
  const snapshot=observer.snapshots.find(x=>
    x.turn===2&&x.attack==='Volt Cyclone');
  assert.ok(snapshot,'Must observe a genuine rank6 turn-two attack board');
  assert.ok(source.observed,'Physical source K0 decision missing');
  assert.equal(line.completed,true);
  assert.equal(line.abortReason,null);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.firstTurnSlot,0);
  assert.ok(game.attackTrace.some(x=>x.seat===1&&x.turn===2&&
    x.attack==='Volt Cyclone'));
  return {source,line,game,snapshot,trace:experiment.actionTrace};
}

/** @returns {object} */
function main() {
  const deck=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const rank6=deck.opponents.find(x=>x.rank===6);
  assert.ok(deck.candidate.cards&&rank6?.cards);
  const engine=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(engine,'game/store/store'));
  const request={
    deckA:deck.candidate.cards,deckB:rank6.cards,
    seed:1819063225,maxActions:125,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true
  };
  const run=benchBackup=>unpack(withStoreDispatchTranscript(Store,
    ()=>withSourceOpeningProbe(()=>
      withBroadThornsSourceAttack(()=>
        withPublicOwnAttackBoard(Store,()=>
          withPublicAttackTargets(Store,()=>runMatch(request))),
        {benchBackup})),
    {liveStoreOnly:true,sourceZoneEveryDispatch:true}));
  const without=run(false),withBackup=run(true);
  assert.deepEqual(without.source.observed.hand,withBackup.source.observed.hand);
  assert.deepEqual(without.source.observed.prizes,withBackup.source.observed.prizes);
  assert.deepEqual(without.source.observed.doubleColorless,
    withBackup.source.observed.doubleColorless);
  assert.deepEqual(without.game.deckHashes,withBackup.game.deckHashes);
  const backupEvent=withBackup.line.events.find(x=>
    x.action==='Bench held backup Iron Thorns ex');
  assert.ok(backupEvent,'The opt-in policy must actually play a backup');
  assert.equal(withBackup.snapshot.ownPublic.bench.length,
    without.snapshot.ownPublic.bench.length+1);
  assert.ok(withBackup.snapshot.ownPublic.bench.some(slot=>
    slot.pokemon?.name==='Iron Thorns ex'));
  const simplify=x=>({
    action:x.action,parameters:x.parameters,
    pendingPrompt:x.pendingPrompt??null,
    choiceReferences:x.choiceReferences??null,
    zone:x.zoneDigestBefore,continuity:x.continuityDigestBefore
  });
  const first=Array.from({length:Math.min(without.trace.length,
    withBackup.trace.length)},(_,i)=>i).find(i=>
      JSON.stringify(simplify(without.trace[i]))!==
      JSON.stringify(simplify(withBackup.trace[i])));
  assert.ok(Number.isInteger(first),'No genuine Store divergence observed');
  assert.equal(without.trace[first].zoneDigestBefore,
    withBackup.trace[first].zoneDigestBefore);
  assert.equal(without.trace[first].continuityDigestBefore,
    withBackup.trace[first].continuityDigestBefore);
  assert.equal(withBackup.trace[first].action,'PlayCardAction');

  const summarize=arm=>({
    openingActive:arm.source.observed.active,
    openingBench:arm.source.observed.occupiedBench,
    firstRank6TurnHand:arm.source.observed.hand,
    ownPublicBoardAtAttack:arm.snapshot.ownPublic,
    opponentPublicBoardAtAttack:arm.snapshot.opponentPublic,
    announcedAttack:arm.snapshot.attack,
    rank6PrizesRemaining:arm.game.prizesRemaining[1],
    gameFinished:arm.game.finished,
    gameWinner:arm.game.finished?arm.game.winner:null,
    actionCount:arm.game.actions,
    turns:arm.game.turns,
    selectedRootActions:arm.line.events
  });
  const result={
    schema:'rank6-source-dealt-backup-bench-counterfactual-v1',
    sourceSeed:request.seed,
    sourceRankPair:[1,6],
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    actualFirstSeat:0,
    beforeDivergence:{
      actionOrdinal:first,
      zoneDigestIdentical:true,continuationDigestIdentical:true
    },
    initialHandPrizeAndDeckHashesIdentical:true,
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false,
    noBackup:summarize(without),
    heldBackupBenched:summarize(withBackup),
    caveats:'One selected real source seed. Bench alternative is an opt-in strategy with unqualified generic opponent and omitted match clock; raw engine pending Pale Moon-GX may require validated rules correction.'
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}
if(require.main===module) main();
module.exports={main,withPublicOwnAttackBoard};
