'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');

const VERSION='agent29-bilateral-generic-trainer-frontier-transport-v1';
const DEFAULT_MAX_ROOTS=384;

/**
 * Summarize real owner-root Trainer competition without promoting a
 * native enumerator candidate to a paper-legal or paid play.
 * Counts are observed decisions, not independent games or opportunities.
 *
 * @param {object} audit Agent5 read-only native frontier audit.
 * @returns {object} Bounded, two-seat comparative diagnostic.
 */
function trainerFrontierSummary(audit){
  assert.ok(Array.isArray(audit?.roots));
  const counts=()=>({
    observedRoots:0,rootsHoldingTrainers:0,
    rootsWithUnblockedTrainer:0,acceptedPassWithUnblockedTrainer:0,
    nativeOfferedCopies:0,genericUnblockedCopies:0,
    selectedTrainerRootsAccepted:0,selectedTrainerRootsRejected:0,
    byType:{Item:0,Supporter:0,Stadium:0,Tool:0}
  });
  const bySeat={0:counts(),1:counts()};
  const examples=[];
  for(const root of audit.roots){
    assert.ok(root.seat===0||root.seat===1);
    const c=bySeat[root.seat];
    const held=root.trainers??[];
    const unblocked=held.filter(x=>x.publicBlocker===null);
    c.observedRoots++;
    if(held.length)c.rootsHoldingTrainers++;
    if(unblocked.length)c.rootsWithUnblockedTrainer++;
    c.genericUnblockedCopies+=unblocked.length;
    c.nativeOfferedCopies+=held.filter(x=>x.nativeEnumeratorOffered===true).length;
    for(const x of unblocked){
      assert.ok(Object.hasOwn(c.byType,x.type));
      c.byType[x.type]++;
    }
    const selected=root.chosen?.trainer??null;
    if(selected&&root.dispatch==='native-accepted')
      c.selectedTrainerRootsAccepted++;
    if(selected&&root.dispatch==='native-rejected')
      c.selectedTrainerRootsRejected++;
    if(root.chosen?.action==='PassTurnAction'&&
      root.dispatch==='native-accepted'&&unblocked.length){
      c.acceptedPassWithUnblockedTrainer++;
      if(examples.length<20)examples.push({
        seat:root.seat,turn:root.turn,
        heldUnblocked:unblocked.map(x=>({
          printing:x.printing,type:x.type,
          nativeEnumeratorOffered:x.nativeEnumeratorOffered
        })),
        // Owner hand data may be archived postgame. It must never be offered
        // to the opposing player's decision policy or a public live feed.
        ownerPrivatePostgameOnly:true
      });
    }
  }
  return {
    version:VERSION,readOnly:true,bySeat,
    observedRootCount:audit.roots.length,
    rootsOmittedDueToCap:audit.rootsOmittedDueToCap,
    nativeCatalogPrintings:audit.nativePrintedTrainerClasses,
    examples,
    rootLedgerSha256:createHash('sha256')
      .update(JSON.stringify(audit.roots)).digest('hex'),
    cardSpecificPaperPlayabilityVerified:false,
    nativeEnumeratorIsComplete:false,
    discardAndTargetPaymentsVerified:false,
    independentCompetitiveGames:0
  };
}

/**
 * Install Agent5's existing generic Trainer census at the innermost shared
 * actor decision boundary, for both real physical seats. This wrapper
 * changes no proposed actions, hand cards, or Store dispatches.
 *
 * @template T
 * @param {()=>T} execute Actual synchronous headless game.
 * @param {{maxRoots?:number,observer?:Function,nativeDeps?:object}} options
 *   Injectable pure test seam; normal execution loads the pinned revision.
 * @returns {{result:T,audit:object}}
 */
function withBilateralOwnerTrainerFrontier(execute,options={}){
  assert.equal(typeof execute,'function');
  const maxRoots=options.maxRoots??DEFAULT_MAX_ROOTS;
  assert.ok(Number.isSafeInteger(maxRoots)&&maxRoots>=1&&maxRoots<=4096);
  const observer=options.observer??
    require('./agent5-native-owner-trainer-frontier-observer.cjs')
      .withNativeOwnerTrainerFrontier;
  const nativeDeps=options.nativeDeps??(()=>{
    const out=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
    const native=relative=>require(path.join(out,relative));
    const manager=require('./headless.cjs').initializeCards();
    return {
      Store:native('game/store/store').Store,
      SimpleTacticsAi:native('simple-bot/simple-tactics-ai').SimpleTacticsAi,
      GamePhase:native('game/store/state/state').GamePhase,
      ActionEnumerator:native('advanced-bot/action-enumerator').ActionEnumerator,
      TrainerCard:native('game/store/card/trainer-card').TrainerCard,
      TrainerType:native('game/store/card/card-types').TrainerType,
      PlayCardAction:native('game/store/actions/play-card-action').PlayCardAction,
      allCards:manager.getAllCards()
    };
  })();
  const observed=observer(execute,{...nativeDeps,seats:[0,1],maxRoots});
  assert.ok(observed?.audit);
  const summary=trainerFrontierSummary(observed.audit);
  return {result:observed.result,audit:{...observed.audit,
    transportVersion:VERSION,summary}};
}

module.exports={VERSION,DEFAULT_MAX_ROOTS,trainerFrontierSummary,
  withBilateralOwnerTrainerFrontier};
