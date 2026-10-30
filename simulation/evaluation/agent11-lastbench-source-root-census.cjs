'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runMatch}=require('../twinleaf/headless.cjs');
const {resolveManifestFile}=require('../twinleaf/resolve-field.cjs');
const {actorObservation}=require('../twinleaf/actor-observation-contract.cjs');

const ROOT=path.resolve(__dirname,'../..');
const OUT=path.join(ROOT,'vendor/twinleaf/ptcg-server/output');
const {Store}=require(path.join(OUT,'game/store/store'));
const {GamePhase}=require(path.join(OUT,'game/store/state/state'));
const SOURCE_SEEDS=[0x2e11c0de,0x3f22b1ed];
const DEDENNE='Dedenne GX UNB',REGIDRAGO='Regidrago V SIT';
const SHA=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

function sourceDecks(){
  const catalog=resolveManifestFile(path.join(ROOT,
    'results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
  const a=catalog.decks.find(row=>row.rank===10);
  const b=catalog.decks.find(row=>row.rank===6);
  assert.ok(a&&b,'Published exact rank10 and rank6 source rows required');
  for(const d of [a,b]){
    assert.equal(d.playableUnderEngine,true,
      'An unresolved original-source 60 cannot be silently substituted: rank '+d.rank);
    assert.equal(d.cardIds.length,60);
  }
  assert.equal(a.cardIds.filter(name=>name===DEDENNE).length,1);
  assert.equal(a.cardIds.filter(name=>name===REGIDRAGO).length,4);
  assert.equal(b.cardIds.filter(name=>name==='Iron Thorns ex TWM').length,4);
  return {regidrago:a,thorns:b};
}

/**
 * Observe owner-authenticated real native roots before Store dispatch.
 * No opponent hand/deck/Prize identity or source opponent decisions enter
 * the decision callback. Native action and receipt matching is mandatory.
 *
 * @param {0|1} sourceSeat
 * @param {()=>object} execute
 * @returns {{result:object,roots:object[],ledgerMatches:boolean}}
 */
function withReadOnlySourceRootCensus(sourceSeat,execute){
  const previous=Store.prototype.dispatch;
  const roots=[];
  Store.prototype.dispatch=function observedNativeDispatch(action){
    const state=this.state;
    let row=null;
    if(state?.phase===GamePhase.PLAYER_TURN &&
        state.activePlayer===sourceSeat && state.players?.length===2 &&
        !state.prompts?.some(p=>p.result===undefined)){
      const view=actorObservation(state,sourceSeat);
      const hand=view.ownHand;
      const benchOccupied=view.ownPublic.bench
        .filter(slot=>slot?.printing).length;
      row={
        turn:state.turn,action:action?.constructor?.name??null,
        played:action?.constructor?.name==='PlayCardAction' ?
          hand[action.handIndex]??null:null,
        ownerHandCount:hand.length,
        opponentActive:view.opponentPublic.active?.printing??null,
        freeBench:5-benchOccupied,
        holdsDedenne:hand.includes(DEDENNE),
        holdsRegidrago:hand.includes(REGIDRAGO),
        matchingIronThorns:
          view.opponentPublic.active?.printing==='Iron Thorns ex TWM',
        accepted:false
      };
      roots.push(row);
    }
    const result=previous.call(this,action);
    if(row)row.accepted=true;
    return result;
  };
  try{
    const result=execute();
    const ledger=(result.rootActionLedger??[]).filter(x=>
      x.playerSlot===sourceSeat&&x.pendingPrompt===null);
    const a=roots.filter(x=>x.accepted).map(x=>({
      turn:x.turn,action:x.action,card:x.played??null}));
    const b=ledger.map(x=>({
      turn:x.turnBefore,action:x.action,card:x.card??null}));
    const ledgerMatches=JSON.stringify(a)===JSON.stringify(b);
    assert.equal(ledgerMatches,true,
      'Real Store root observer must match returned native root-action ledger');
    return {result,roots,ledgerMatches};
  }finally{Store.prototype.dispatch=previous;}
}

function runTrial(a,b,seed,sourceSeat){
  const ids=sourceSeat===0?[a.cardIds,b.cardIds]:[b.cardIds,a.cardIds];
  let returned=null,error=null;
  try{
    returned=withReadOnlySourceRootCensus(sourceSeat,
      ()=>runMatch({deckA:ids[0],deckB:ids[1],seed,maxActions:120,
        entryDrawLockCorrection:true,captureDecisionTrace:true,
        captureInitialSourceDealFingerprintSeat:sourceSeat,
        label:'agent11-original-source-root-census-r10v6'}));
  }catch(e){error={name:e?.name??null,message:String(e?.message||e)};}
  if(error)return {seed,sourceSeat,status:'engine-or-observer-error',
    error,competitiveQualified:false};
  const {result,roots,ledgerMatches}=returned;
  const printedLock=roots.filter(x=>x.matchingIronThorns);
  const holdsBoth=printedLock.filter(x=>x.holdsDedenne&&x.holdsRegidrago);
  const contested=holdsBoth.filter(x=>x.freeBench<=1&&x.freeBench>=0);
  const sample=contested.slice(0,3).map(x=>({
    turn:x.turn,action:x.action,freeBench:x.freeBench,
    firstReturnNotAssessed:true,rootOwnerHandCount:x.ownerHandCount}));
  return {seed,sourceSeat,status:'executed',engineFinished:result.finished,
    endReason:result.endReason,actions:result.actions,actualStarterSeat:result.firstTurnSlot,
    sourceDealFingerprint:result.initialSourceDealFingerprint?.digestSha256??null,
    nativeLedgerMatches:ledgerMatches,sourceNativeRoots:roots.length,
    printedIronThornsActiveRoots:printedLock.length,
    printedLockedRootsHoldingBoth:holdsBoth.length,
    lastBenchHoldingBothRoots:contested.length,
    samples:sample,competitiveQualified:false};
}
function run(){
  const {regidrago,thorns}=sourceDecks();
  const trials=SOURCE_SEEDS.flatMap(seed=>
    [0,1].map(seat=>runTrial(regidrago,thorns,seed,seat)));
  return {
    schema:'agent11-source-original-print-root-presence-census-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    source:'results/aichi-2026/full-decklists.json',
    sourceRank10Sha256:SHA(regidrago.cardIds),
    sourceRank6Sha256:SHA(thorns.cardIds),
    originalSource60Count:2,sourceSeeds:SOURCE_SEEDS,trialCount:trials.length,
    sourcePublishedNames:'rank10 Regidrago; rank6 Iron Thorns',
    observer:'owner-only detached actorObservation before native dispatch, strict returned root ledger parity',
    results:trials,
    totals:{
      executed:trials.filter(x=>x.status==='executed').length,
      failures:trials.filter(x=>x.status!=='executed').length,
      printedLockedRootsHoldingBoth:
        trials.reduce((n,x)=>n+(x.printedLockedRootsHoldingBoth||0),0),
      contestedLastBenchRoots:
        trials.reduce((n,x)=>n+(x.lastBenchHoldingBothRoots||0),0)
    },
    competitiveQualifiedGames:0,
    caveat:'Four bounded unqualified original-source SimpleTactics matches, no hidden-deal propensity inference; source first-return competence, legality, actual winning policy and 32-field coverage missing.'};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={sourceDecks,withReadOnlySourceRootCensus,runTrial,run};
