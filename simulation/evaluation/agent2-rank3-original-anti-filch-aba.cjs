'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {initializeCards,runMatch}=
  require('../twinleaf/headless.cjs');
const {originals}=
  require('./agent41-rank3-arbitration-original-store.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('./agent7-canonical-actor-composition.cjs');
const {withActorOnlyRootPolicy}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withNativePaperSupporterDiscipline}=
  require('../twinleaf/agent41-paper-supporter-discipline.cjs');
const {withSameTargetAttachEnergySelection}=
  require('../twinleaf/same-target-attach-energy-hook.cjs');

const VERSION='agent2-original-rank3-vs-rank1-avoid-filch-self-deckout-aba-v1';
const SOURCE_SEAT=0,OPPONENT_SEAT=1,SEED=290134;
const ACTION_LIMIT=520,CONSERVATIVE_DECK_THRESHOLD=24;
const EXPECTED_FULL_DEAL=
  'e7304d2a152496945cb9513e50a5e5680a6405ada4cc8ceb1e447f6ade7dddeb';
const EXPECTED_SOURCE_DEAL=
  'ed055a7d1db05b794eea2c63661593e21961dac77e850674ef2dbab57bfa787a';
const SHA=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const native=p=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',p));

/**
 * Minimal owner-safe opponent defense: if the existing rank-1 bot selects
 * Filch while its own remaining deck has <=24 cards, use the ordinary legal
 * PassTurnAction. This is a deliberately weak lower-bound rationality gate.
 * It reads only the owner's Active, own public deck count and current action.
 * No concealed opposing cards, deck contents, Prize cards, future states, or
 * different card actions are consulted. It does not claim optimal defense.
 *
 * @template T
 * @param {()=>T} execute Real native Store game.
 * @returns {{result:T,audit:object}}
 */
function withRank1ConservativeFilch(execute){
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {PassTurnAction}=native('game/store/actions/game-actions');
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  const audit={feature:'rank1-conservative-public-own-deck-avoid-Filch-v1',
    sourceSeat:SOURCE_SEAT,opponentSeat:OPPONENT_SEAT,
    threshold:CONSERVATIVE_DECK_THRESHOLD,
    proposedFilch:0,acceptedFilch:0,replacedWithPass:0,
    replacements:[],ownerOnly:true,
    competitivelyQualifiedGames:0};
  const guarded=function conservativeFilchDecision(state,...args){
    const proposed=original.call(this,state,...args);
    const prompt=state.prompts.find(p=>p.result===undefined);
    if(prompt||state.activePlayer!==OPPONENT_SEAT||
      proposed?.constructor.name!=='AttackAction'||proposed.name!=='Filch')
      return proposed;
    const owner=state.players[OPPONENT_SEAT];
    const ownerActive=owner.active.getPokemonCard()?.name??null;
    if(ownerActive!=='Mimikyu')return proposed;
    audit.proposedFilch++;
    if(owner.deck.cards.length>CONSERVATIVE_DECK_THRESHOLD){
      audit.acceptedFilch++;
      return proposed;
    }
    const replacement=new PassTurnAction(owner.id);
    audit.replacedWithPass++;
    audit.replacements.push({
      globalTurn:state.turn,ownerActive,
      ownDeckRemaining:owner.deck.cards.length,
      selected:'PassTurnAction',
      replacedExisting:'AttackAction Filch'
    });
    return replacement;
  };
  SimpleTacticsAi.prototype.decodeNextAction=guarded;
  try{
    return {result:execute(),audit};
  }finally{
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,guarded);
    SimpleTacticsAi.prototype.decodeNextAction=original;
  }
}

/**
 * A/B/A source original 60 and exact rank1 original 60; same physical cards.
 * @param {'control'|'conservative'|'control-repeat'} variant
 * @param {{source:string[],candidate:string[]}} cards
 * @returns {object} Machine-readable native evidence without hidden cards.
 */
function runArm(variant,cards){
  const request={
    deckA:cards.source,deckB:cards.candidate,
    seed:SEED,maxActions:ACTION_LIMIT,
    label:'agent2-original-rank3-anti-filch-'+variant,
    strictPromptValidation:true,mandatoryOptionFallback:true,
    enforceSelectOptionLegality:true,
    enforceVisiblePlayLockBothSeats:true,
    captureInitialFullPhysicalDeal:true,
    captureInitialSourceDealFingerprintSeat:SOURCE_SEAT,
    captureDecisionTrace:true,
    captureNativeAbortEvidence:true,
    capturePublicAttackTransitions:true,
    captureFinalPublicBoard:true
  };
  try{
    let observerAudit=null;
    const simulate=()=>{
      const match=()=>withSameTargetAttachEnergySelection(
        ()=>runMatch(request)).result;
      if(variant!=='conservative')return match();
      const observed=withRank1ConservativeFilch(match);
      observerAudit=observed.audit;
      return observed.result;
    };
    const guarded=withNativePaperSupporterDiscipline(()=>
      withCanonicalActorOnlyPolicy(simulate,{
        root:work=>withActorOnlyRootPolicy(work,{
          publicContextSpecialEnergy:true,specialEnergyRoot:true
        })
      },{ownerSingleSearch:true,genericFallbackAttribution:true}));
    const game=guarded.result.result;
    const originalSourceBurrow=game.attackDeclarationTrace.filter(
      a=>a.playerSlot===SOURCE_SEAT&&a.attackName==='Burrow');
    const referenceFilch=game.attackDeclarationTrace.filter(
      a=>a.playerSlot===OPPONENT_SEAT&&a.attackName==='Filch');
    return {
      variant,status:game.finished?'native-terminal':'native-cap',
      firstFullDeal:game.initialFullPhysicalDealFingerprint?.digestSha256??null,
      sourceDeal:game.initialSourceDealFingerprint?.digestSha256??null,
      winner:game.winner,actions:game.actions,turns:game.turns,
      rootLedgerSha256:SHA(game.rootActionLedger),
      originalSourceBurrowAttackDeclarations:originalSourceBurrow.length,
      sourceBurrowTurns:originalSourceBurrow.map(a=>a.turnBefore),
      originalRank1FilchAttackDeclarations:referenceFilch.length,
      originalRank1FilchTurns:referenceFilch.map(a=>a.turnBefore),
      terminalTransition:game.terminalTransition??null,
      finalPublicBoard:game.finalPublicBoard??null,
      observerAudit,competitivelyQualified:false
    };
  }catch(error){
    return {variant,status:'native-error',
      error:String(error?.stack??error).slice(0,3500),
      competitivelyQualified:false};
  }
}

/** @returns {object} Unselected original-deal opponent reply stress test. */
function run(){
  initializeCards();
  const cards=originals();
  const old=new Map([
    ['AGENT8_ACTOR_QUICK_BALL_DEV',process.env.AGENT8_ACTOR_QUICK_BALL_DEV],
    ['AGENT41_OWNER_TERMINAL_ARBITRATION_DEV',
      process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV]
  ]);
  try{
    process.env.AGENT8_ACTOR_QUICK_BALL_DEV='false';
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    const registeredArms=['control','conservative','control-repeat'];
    const arms=registeredArms.map(x=>runArm(x,cards));
    const [a,b,again]=arms;
    const sameDeal=arms.every(x=>x.status!=='native-error'&&
      x.firstFullDeal===EXPECTED_FULL_DEAL&&
      x.sourceDeal===EXPECTED_SOURCE_DEAL);
    const exactRepeat=sameDeal&&a.status===again.status&&
      a.winner===again.winner&&a.actions===again.actions&&
      a.rootLedgerSha256===again.rootLedgerSha256;
    return {
      schema:VERSION,sourceRank:3,referenceRank:1,
      seed:SEED,sourceSeat:SOURCE_SEAT,opponentSeat:OPPONENT_SEAT,
      actionLimit:ACTION_LIMIT,
      opponentOwnDeckConservationThreshold:CONSERVATIVE_DECK_THRESHOLD,
      originalSourceSha256:SHA(cards.source),
      originalReferenceSha256:SHA(cards.candidate),
      nativePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      registeredArms,arms,
      controls:{
        sameOriginalPhysicalDealAllArms:sameDeal,
        exactControlRepeat:exactRepeat,
        treatmentUsesActualLegalPass:b.observerAudit?.replacedWithPass>0,
        historicalBaselineSourceWin:a.winner===SOURCE_SEAT,
        competitiveQualifiedGames:0
      },
      interpretationLimits:'Prospectively fixed 24-card own-deck threshold on one known historical source-win deal; limited defense substituting a legal Pass for Filch and no alternative attacker. Does not demonstrate rational opponent policy, field win rate or paper-clock result.'
    };
  }finally{
    for(const [key,value] of old){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}
if(require.main===module){
  const data=run();
  process.stdout.write(JSON.stringify(data,null,2)+'\n');
  if(data.arms.some(x=>x.status==='native-error')||
    !data.controls.sameOriginalPhysicalDealAllArms||
    !data.controls.exactControlRepeat)
    process.exitCode=1;
}
module.exports={VERSION,run,withRank1ConservativeFilch};
