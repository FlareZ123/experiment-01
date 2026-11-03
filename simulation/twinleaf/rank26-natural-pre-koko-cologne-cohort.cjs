'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {initializeCards}=require('./headless.cjs');
const {RANK26_PROPAGATION_PROFILE,runWithResearchProfile}=
  require('./policy-profiles.cjs');
const {withRank26CologneOpener}=
  require('./rank26-cologne-opener.cjs');
const {createFullPhysicalDealObserver}=
  require('../evaluation/full-physical-deal-fingerprint.cjs');
const {sourceCompressorAbortAudit}=
  require('./agent3-compressor-root-provenance-v3.cjs');

const ENGINE='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const REPEATS=Object.freeze(Array.from({length:12},(_,i)=>84+i));
const BASE=20261102;
const CAP=120;
const digest=cards=>crypto.createHash('sha256')
  .update(JSON.stringify(cards)).digest('hex');

/**
 * Observe the ACTUAL engine Store stable initial deal before normal actions.
 * Observe both players' complete physically ordered zones as an opaque hash.
 * It never passes hidden information into bot decisions. Native exceptions
 * remain trial outcomes, not reasons to discard a source deal.
 *
 * @param {()=>object} call
 */
function withDealFingerprint(call){
  const {Store}=require(path.join(OUTPUT,'game/store/store'));
  const original=Store.prototype.dispatch;
  const observer=createFullPhysicalDealObserver();
  let root=null;
  let error=null;
  let abortSourceCompressorAudit=null;
  let result=null;
  const observe=function(action,...args){
    if(!root&&action?.constructor?.name==='AddPlayerAction'&&
        action.clientId===101)root=this;
    const out=original.call(this,action,...args);
    if(this===root)observer.observe(this.state);
    return out;
  };
  Store.prototype.dispatch=observe;
  try{
    try{result=call();}
    catch(e){
      error=String(e?.stack||e).slice(0,3000);
      // Keep causal native source receipts when the enclosed game aborts.
      // Error text alone irreversibly loses the physical settlement witness.
      abortSourceCompressorAudit=sourceCompressorAbortAudit(e);
    }
    return {result,error,abortSourceCompressorAudit,
      physicalRoot:observer.result(),
      liveRootIdentified:root!==null};
  }finally{
    assert.equal(Store.prototype.dispatch,observe);
    Store.prototype.dispatch=original;
  }
}

/** Record actual source-owned first turn decisions for a single arm. */
function summarize(observed,seat,seed,deckA,deckB){
  const game=observed.result?.result??observed.result;
  const out={
    firstStableNativeRoot:observed.physicalRoot?.digestSha256??null,
    rootObserved:observed.liveRootIdentified,
    error:observed.error,
    sourceActions:[],
    sourceFirstTurnCologne:0,
    sourceFirstTurnKokoAbility:0,
    sourceFirstTurnCrisisPunch:0,
    sourceFirstTurnPumps:0,
    sourceFirstTurnPropagation:0,
    sourceFirstTurnOpponentPrizes:null,
    sourceActuallyFirst:null,
    engineTerminal:false,
    engineWinner:null,
    actionCapped:false
  };
  if(!game)return out;
  assert.equal(game.engine,ENGINE);
  assert.equal(game.seed,seed);
  assert.deepEqual(game.deckHashes,[digest(deckA),digest(deckB)]);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.researchPolicyProfile,RANK26_PROPAGATION_PROFILE);
  out.sourceActuallyFirst=game.firstTurnSlot===seat;
  out.actionCapped=game.finished!==true;
  out.engineTerminal=game.finished===true;
  out.engineWinner=game.finished===true?game.winner:null;
  const actions=(game.decisionTrace||[]).filter(e=>
    e.playerSlot===seat&&e.turnBefore===1);
  out.sourceActions=actions.map(e=>({
    action:e.action,card:e.card??null,ability:e.ability??null,
    ordinal:e.actionOrdinal,
    opponentPrizesAfter:e.prizesAfter?.[1-seat]??null
  }));
  out.sourceFirstTurnCologne=actions.filter(e=>
    e.action==='PlayCardAction'&&e.card==='Canceling Cologne').length;
  out.sourceFirstTurnKokoAbility=actions.filter(e=>
    e.action==='UseAbilityAction'&&e.ability==='Dance of the Ancients').length;
  out.sourceFirstTurnCrisisPunch=actions.filter(e=>
    e.action==='AttackAction'&&e.attack==='Crisis Punch').length;
  out.sourceFirstTurnPumps=actions.filter(e=>
    e.action==='PlayCardAction'&&e.card==='Damage Pump').length;
  out.sourceFirstTurnPropagation=actions.filter(e=>
    e.action==='UseAbilityAction'&&e.ability==='Propagation').length;
  out.sourceFirstTurnOpponentPrizes=actions.length?
    actions.at(-1).prizesAfter[1-seat]:null;
  return out;
}

/** @returns {object} */
function run(){
  initializeCards();
  const field=planAichi(26,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const source=field.candidate.cards;
  const opponent=field.opponents.find(r=>r.rank===6)?.cards;
  assert.equal(source.length,60);
  assert.equal(opponent?.length,60);
  const cases=[],seen=new Set();
  for(const repeat of REPEATS){
    const seeds=deriveSlotSeeds(BASE,'pilot',26,repeat);
    for(const [slot,seat,seed] of [
      ['A',0,seeds.A],['B',1,seeds.B]]){
      assert.ok(Number.isSafeInteger(seed)&&seed>0&&!seen.has(seed));
      seen.add(seed);
      const a=seat===0?source:opponent;
      const b=seat===1?source:opponent;
      const request={
        deckA:a,deckB:b,rank26SourceSeat:seat,
        seed,maxActions:CAP,strictPromptValidation:true,
        isolatePolicyRandomness:true,captureDecisionTrace:true,
        forestSealSearchCorrection:true,
        leleEntryAbilityLockCorrection:true,
        entryDrawLockCorrection:true,
        label:'agent3-source-prekoko-'+repeat+'-'+slot
      };
      const control=withDealFingerprint(()=>
        runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE));
      const optIn=withDealFingerprint(()=>
        withRank26CologneOpener(seat,()=>
          runWithResearchProfile(request,RANK26_PROPAGATION_PROFILE),
          {unlockBenchedKoko:true}));
      const left=summarize(control,seat,seed,a,b);
      const right=summarize(optIn,seat,seed,a,b);
      const fullPair=left.firstStableNativeRoot&&right.firstStableNativeRoot?
        left.firstStableNativeRoot===right.firstStableNativeRoot?
          'EXACT_SOURCE_DEAL_MATCH':'SOURCE_DEAL_DIFFERENT':'UNVERIFIED';
      const audit=optIn.result?.policyAudit??null;
      if(audit){
        assert.equal(audit.version,'rank26-cologne-pre-koko-v2');
      }
      cases.push({repeat,slot,seed,sourceSeat:seat,
        dealDisposition:fullPair,control:left,variant:right,
        optionalPolicyAudit:audit?{
          version:audit.version,selections:audit.opportunitiesSelected,
          actions:audit.actions
        }:null,
        paperQualified:false,competitiveGameQualified:false});
    }
  }
  assert.equal(cases.length,24);
  const original=cases.filter(c=>c.control.sourceActuallyFirst===true);
  const summary={
    originalSourceDeals:24,developmentArms:48,
    matchedSourceDeals:cases.filter(c=>
      c.dealDisposition==='EXACT_SOURCE_DEAL_MATCH').length,
    mismatchedSourceDeals:cases.filter(c=>
      c.dealDisposition==='SOURCE_DEAL_DIFFERENT').length,
    unverifiedSourceDeals:cases.filter(c=>
      c.dealDisposition==='UNVERIFIED').length,
    actualSourceFirst:original.length,
    sourceFirstBaselineCologne:original.filter(c=>
      c.control.sourceFirstTurnCologne>0).length,
    sourceFirstOptInCologne:original.filter(c=>
      c.variant.sourceFirstTurnCologne>0).length,
    optInPolicySelected:cases.filter(c=>
      c.optionalPolicyAudit?.selections>0).length,
    sourceFirstOptInKoko:original.filter(c=>
      c.variant.sourceFirstTurnKokoAbility>0).length,
    sourceFirstOptInCrisisPunch:original.filter(c=>
      c.variant.sourceFirstTurnCrisisPunch>0).length,
    sourceFirstOptInFiveKoState:original.filter(c=>
      c.variant.sourceFirstTurnOpponentPrizes===1).length,
    nativeErrors:cases.flatMap(c=>[
      c.control.error?{repeat:c.repeat,slot:c.slot,arm:'control'}:null,
      c.variant.error?{repeat:c.repeat,slot:c.slot,arm:'variant'}:null
    ]).filter(Boolean),
    competitiveGames:0
  };
  return {
    schema:'agent3-rank26-pre-koko-owner-natural-24deal-v1.1',
    sourceRank:26,opponentRank:6,original60s:[60,60],
    engineRevision:ENGINE,sourceDeckDigest:digest(source),
    opponentDeckDigest:digest(opponent),
    seedBase:BASE,repeatRange:[84,95],seats:[0,1],
    maximumNativeActions:CAP,
    controlPolicy:RANK26_PROPAGATION_PROFILE,
    variantPolicy:'rank26-cologne-pre-koko-v2 opt-in over frozen source propagation',
    qualification:{naturalSetupObserved:true,fullGamePaper:false,
      opponentPolicyCompetence:false,paperClock:false,
      competitiveGameRate:false},
    summary,cases
  };
}

module.exports={run,withDealFingerprint,REPEATS,BASE};
if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
